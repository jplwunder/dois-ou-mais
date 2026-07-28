import React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Alert } from "./components/ui/alert";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Spinner } from "./components/ui/spinner";
import { Empty } from "./components/ui/empty";
import { useAuth } from "./hooks/useAuth";
import { useNavigation } from "./hooks/useNavigation";
import { useApi } from "./hooks/useApi";
import { useEvents } from "./hooks/useEvents";

import { Header } from "./components/Header";
import AuthScreen from "./screens/AuthScreen";
import Dashboard from "./screens/Dashboard";
import EventDetail from "./screens/EventDetail";
import PublicEventSubscription from "./screens/PublicEventSubscription";

import axiosInstance from "./lib/api";
import apiRequest from "./lib/apiRequest"

// ---------------------------------------------------------------------------
// Ponto de Entrada Principal (Orquestrador Global)
// ---------------------------------------------------------------------------
export default function App() {
  // Authentication state
  const path = window.location.pathname;
  const match = window.location.pathname.match(/^\/evento\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/);
  const urlParams = new URLSearchParams(window.location.search);
  const token_email = urlParams.get("token");
  const publicEventId = match ? match[1] : null;
  const { token, currentUser, login, logout } = useAuth();
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Navigation state
  const { view, selectedEvent, openEvent, backToDashboard, reset } = useNavigation();

  const handleUnauthorized = useCallback(() => {
    logout();
    reset();
  }, [logout, reset]);

  // API wrapper
  const api = useApi(token, handleUnauthorized);

  // Global event state
  const { events, loading: eventsLoading, error: eventsError, refreshEvents, clearEvents } = useEvents(
    api,
    token
  );

  function handleAuthenticated(newToken, user) {
    login(newToken, user);
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  }

  function handleLogout() {
    logout();
    reset();
    clearEvents();
  }

  function handleOpenEvent(event) {
    openEvent(event);
  }

  function handleBackToDashboard() {
    backToDashboard();
    refreshEvents();
  }

  function handleConfirmEmail(token_email) {

    api(`/verify?token=${token_email}`, { method: "GET" })
      .then((data) => {
        setEmailConfirmed(true);
        setTimeout(() => setEmailConfirmed(false), 50000);
      })
      .catch((e) => {
        // Usa o e.message que o seu utilitário apiRequest já extrai do FastAPI!
        console.error("Erro ao confirmar email:", e.message);
        setEmailError(e.message || "Não foi possível confirmar o email. O link pode ter expirado ou já ter sido usado.");
      });
  }

  useEffect(() => {
    // Busque o token diretamente dentro do useEffect no momento em que o componente monta
    const urlParams = new URLSearchParams(window.location.search);
    const tokenDaUrl = urlParams.get('token'); // certifique-se de que o nome na URL é 'token'

    // Só dispara se o token realmente existir na URL do navegador
    if (tokenDaUrl) {
      handleConfirmEmail(tokenDaUrl);
    }
  }, []); // Array de dependências VAZIO para rodar estritamente UMA VEZ na montagem


  // Route rendering
  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-200">
      {emailConfirmed && (
        <Alert tone="success" className="m-4">
          Email confirmado com sucesso! Você já pode entrar no sistema.
        </Alert>
      )}
      {emailError && (
        <Alert tone="error" className="m-4">
          {emailError}
        </Alert>
      )}
      {publicEventId && (!token || !currentUser) ? (
        <PublicEventSubscription api={api} onFinished={handleAuthenticated} eventId={publicEventId} />
      ) : !token || !currentUser ? (
        <AuthScreen api={api} onAuthenticated={handleAuthenticated} />
      ) : (
      <>
        <Header user={currentUser} onLogout={handleLogout} onLogoClick={handleBackToDashboard} />

      <main className="animate-in fade-in duration-300">
        {view === "dashboard" && (
          <Dashboard
            api={api}
            events={events}
                eventsLoading={eventsLoading}
                eventsError={eventsError}
                onRefresh={refreshEvents}
                onOpenEvent={handleOpenEvent}
              />
            )}
            {view === "event" && selectedEvent && (
              <EventDetail
                api={api}
                event={selectedEvent}
                currentUser={currentUser}
                onBack={handleBackToDashboard}
                onDeleted={handleBackToDashboard}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
