import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { Alert } from "../components/ui/alert";
import { CalendarPlus, Calendar, MapPin, UserIcon, Mail, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { formatDateTime } from "../lib/utils";

// ---------------------------------------------------------------------------
// Sub-telas: Inscrição Pública de Evento (Acessível sem Login)
// ---------------------------------------------------------------------------
export default function PublicEventSubscription({ api, onFinished, eventId }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  // Carrega os detalhes públicos do evento ao montar a tela
  useEffect(() => {
    async function fetchPublicEvent() {
      try {
        setLoading(true);
        // Utiliza a rota pública existente para buscar informações do evento
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

  async function handleRegisterAndSubscribe() {
    if (!form.name || !form.email || !form.password) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
        if (event) {
      // 1. Cria a conta do Usuário (Inicia desativada/pendente de verificação)
      const userPayload = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      await api("/users", { method: "POST", body: userPayload });

      
        // 2. Realiza o login imediato para obter o token provisório
        const tokenData = await api("/login", {
          form: true,
          method: "POST",
          body: { username: form.email, password: form.password },
        });
      }
      // 2. Realiza o login imediato para obter o token provisório
      const tokenData = await api("/login", {
        form: true,
        method: "POST",
        body: { username: form.email, password: form.password },
      });

      // 3. Inscreve o usuário recém-criado no evento usando o token gerado
      await api(`/attendees/tickets?event_id=${encodeURIComponent(eventId)}`, { 
        method: "POST",
        token: tokenData.access_token 
      });

      setSuccess(true);
      
      // Pequeno delay para o usuário ler a mensagem antes de ir para a Dashboard
      setTimeout(async () => {
        const me = await api("/me", { token: tokenData.access_token });
        onFinished(tokenData.access_token, me);
      }, 3500);

    } catch (e) {
      setError(e.message || "Ocorreu um erro ao processar sua inscrição.");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarPlus className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Inscrição de Evento</span>
        </div>

        {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}

        {success ? (
          <Card className="p-6 text-center shadow-md border-emerald-500/30 bg-emerald-500/5">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground">Inscrição pré-registrada!</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Obrigado por escolher os nossos serviços!
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" /> Redirecionando para a dashboard...
            </div>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
}