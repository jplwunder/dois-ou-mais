import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { Alert } from "../components/ui/alert";
import { CalendarPlus, Calendar, MapPin, UserIcon, Mail, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { formatDateTime } from "../lib/utils";
import AccountVerification from "./AccountVerification";

// ---------------------------------------------------------------------------
// Sub-telas: Inscrição Pública de Evento (Acessível sem Login)
// ---------------------------------------------------------------------------
export default function PublicEventSubscription({ api, onFinished, eventId }) {
  const [stage, setStage] = useState("form");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    async function fetchPublicEvent() {
      try {
        setLoading(true);
        const data = await api(`/events/${eventId}`, { token: null });
        setEvent(data);
      } catch (e) {
        setError("Não foi possível coletar as informações deste evento. Verifique se o ID está correto.");
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchPublicEvent();
  }, [eventId, api]);

  async function doLogin() {
    return api("auth/login", {
      form: true,
      method: "POST",
      body: {
        username: form.email,
        password: form.password,
      },
    });
  }

  async function fetchMe(token) {
    return api("auth/me", { token });
  }

  async function subscribeToEvent(token) {
    return api(
      `/attendees/tickets?event_id=${encodeURIComponent(eventId)}`,
      {
        method: "POST",
        token,
      }
    );
  }


  async function loginVerifyAndSubscribe() {
    let tokenData;
    try {
      tokenData = await doLogin();
    } catch (e) {
      if (e.status === 401) {
        throw new Error("E-mail ou senha incorretos.");
      }
      if (e.status === 404) {
        throw new Error("Usuário não encontrado.");
      }
      throw e;
    }

    let me;
    try {
      me = await fetchMe(tokenData.access_token);
    } catch (e) {
      if (e.status === 403) {
        setStage("verify");
        return null;
      }
      throw e;
    }

    await subscribeToEvent(tokenData.access_token);

    setStage("success");
    onFinished(tokenData.access_token, me);
    return { tokenData, me };
  }

  async function handleRegisterAndSubscribe() {
    if (!form.name || !form.email || !form.password) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      try {
        await api("/users", {
          method: "POST",
          body: {
            name: form.name,
            email: form.email,
            password: form.password,
          },
        });
      } catch (e) {
        if (
          e.status !== 409 &&
          !e.message?.toLowerCase().includes("already registered")
        ) {
          throw e;
        }
      }

      // Faz login -> confere verificação -> inscreve -> conclui
      let token;
      setStage("verify");
      token = await doLogin();
      await subscribeToEvent(token.access_token);
      setStage("success");
      onFinished(token.access_token, me);
    } catch (e) {
      setError(e.message || "Ocorreu um erro ao processar sua inscrição.");
    } finally {
      setSubmitting(false);
    }
  }


  async function handleAccountVerified() {
    setSubmitting(true);
    setError("");
    try {

      await loginVerifyAndSubscribe();
    } catch (e) {
      setStage("form");
      setError(e.message || "Não foi possível concluir a inscrição após a verificação.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <Spinner className="h-8 w-8 text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando detalhes do evento...</p>
        </div>
      </div>
    );
  }

  if (stage === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <AccountVerification
            api={api}
            email={form.email}
            onVerified={handleAccountVerified}
          />
        </div>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h1 className="text-lg font-semibold text-foreground">Inscrição confirmada!</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecionando para o sistema...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarPlus className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Inscrição de Evento</span>
        </div>

        <Card className="p-6 shadow-md bg-card">
          {event && (
            <div className="mb-6 border-b border-border/60 pb-4">
              <h1 className="text-xl font-bold text-foreground leading-tight">{event.name}</h1>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(event.date)}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</p>
              </div>
              {event.description && (
                <p className="mt-3 text-xs text-muted-foreground/90 bg-muted/40 p-2.5 rounded-lg line-clamp-3">
                  {event.description}
                </p>
              )}
            </div>
          )}

          <h2 className="text-sm font-semibold text-foreground mb-4">Preencha seus dados para garantir sua vaga:</h2>

          {error && (
            <Alert variant="destructive" className="mb-4 text-xs">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="pub-name">Nome Completo *</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pub-name"
                  className="pl-9"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pub-email">E-mail *</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pub-email"
                  type="email"
                  className="pl-9"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pub-password">Crie uma Senha *</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pub-password"
                  type="password"
                  className="pl-9"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Sua senha servirá para acessar o painel após a verificação.</p>
            </div>

            <Button
              className="w-full mt-4"
              onClick={handleRegisterAndSubscribe}
              disabled={submitting}
            >
              {submitting && <Spinner />}
              Confirmar Inscrição Gratuita
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}