import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { Alert } from "../components/ui/alert";
import {
  CalendarPlus,
  Calendar,
  Clock,
  MapPin,
  UserIcon,
  Mail,
  Lock,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  BadgeDollarSign,
} from "lucide-react";
import { formatDateTime } from "../lib/utils";
import AccountVerification from "./AccountVerification";

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Sub-telas: Inscrição Pública de Evento (Acessível sem Login)
// Estágios: landing -> form -> verify -> success
// ---------------------------------------------------------------------------
export default function PublicEventSubscription({ api, onFinished, eventId }) {
  const [stage, setStage] = useState("landing");

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
      "/attendees/tickets",
      {
        method: "POST",
        token,
        body: { event_id: eventId },
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

      // A inscrição acontece após a confirmação da conta.
      setStage("verify");
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

  if (stage === "landing") {
    if (!event) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
          <div className="w-full max-w-md">
            <Alert variant="destructive" className="text-sm">
              {error || "Evento não encontrado. Verifique o link que você recebeu."}
            </Alert>
          </div>
        </div>
      );
    }

    const date = parseDate(event.date);
    const day = date ? date.toLocaleDateString("pt-BR", { day: "2-digit" }) : "--";
    const month = date
      ? date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
      : "";
    const weekday = date ? date.toLocaleDateString("pt-BR", { weekday: "long" }) : "";
    const fullDate = date
      ? date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
      : "Data a confirmar";
    const time = date
      ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : null;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-2xl">
          <Card className="overflow-hidden bg-card shadow-md">
            {/* Cabeçalho: data em destaque + nome do evento */}
            <div className="flex flex-col gap-6 bg-primary/5 p-6 sm:flex-row sm:items-center sm:p-10">
              <div
                className="flex h-28 w-28 shrink-0 flex-col items-center justify-center bg-primary text-primary-foreground"
                aria-hidden="true"
              >
                <span className="text-4xl font-bold leading-none">{day}</span>
                <span className="mt-1 text-sm font-medium capitalize">{month}</span>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Você foi convidado para
                </p>
                <h1 className="break-words text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                  {event.name}
                </h1>
              </div>
            </div>

            {/* Informações principais */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-10 sm:pb-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted">
                  <Calendar className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-semibold text-foreground">{fullDate}</p>
                  {weekday && (
                    <p className="text-sm capitalize text-muted-foreground">{weekday}</p>
                  )}
                </div>
              </div>

              {time && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted">
                    <Clock className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-semibold text-foreground">{time}</p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-3 sm:col-span-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted">
                    <MapPin className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-semibold text-foreground">{event.location}</p>
                  </div>
                </div>
              )}

              {event.price && (
                <div className="flex items-start gap-3 sm:col-span-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted">
                    <BadgeDollarSign className="h-5 w-5 text-foreground"/>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="font-semibold text-foreground">{event.price}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Descrição */}
            {event.description && (
              <div className="px-6 pb-6 sm:px-10">
                <h2 className="mb-2 text-sm font-semibold text-foreground">Sobre o evento</h2>
                <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </div>
            )}

            {/* Chamada para ação */}
            <div className="border-t border-border/60 bg-muted/30 p-6 sm:px-10">
              <Button
                size="lg"
                className="w-full gap-2 text-base"
                onClick={() => {
                  setError("");
                  setStage("form");
                }}
              >
                <CalendarPlus className="h-5 w-5" />
                Quero me Inscrever
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Inscrição gratuita. Leva menos de um minuto.
              </p>
            </div>
          </Card>
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

  // -------------------------------------------------------------------------
  // Estágio 2: formulário de inscrição
  // -------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => {
            setError("");
            setStage("landing");
          }}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o evento
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center bg-primary rounded-2xl">
            <CalendarPlus className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Inscrição de Evento</span>
        </div>

        <Card className="p-6 shadow-md bg-card">
          {event && (
            <div className="mb-6 border-b border-border/60 pb-4">
              <h1 className="text-xl font-bold text-foreground leading-tight">{event.name}</h1>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(event.date)}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</p>
              </div>
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