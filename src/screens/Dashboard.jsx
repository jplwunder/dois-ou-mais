import React, { useState } from "react";
import { Calendar, Link2, MapPin, Plus, Search } from "lucide-react";
import { Alert, Badge, Button, Card, EmptyState, Input, Label, Modal, Spinner, Textarea } from "../components/ui";
import { extractEventId, formatDateTime } from "../lib/utils";

// ---------------------------------------------------------------------------
// Painel Principal (Lista de Eventos)
// ---------------------------------------------------------------------------

export default function Dashboard({ api, events, eventsLoading, eventsError, onRefresh, onOpenEvent }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", location: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [joinValue, setJoinValue] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const roleConfig = {
  admin: {
    tone: "admin",
    label: "Administrador",
    },
  staff: {
    tone: "staff",
    label: "Equipe",
    },
  attendee: {
    tone: "attendee",
    label: "Participante",
    },
  };

  async function handleCreate() {
    setCreating(true);
    setCreateError("");
    try {
      if (!form.name || !form.date || !form.location) {
        throw new Error("Por favor, informe no mínimo o nome, a data e o local.");
      }
      const payload = {
        name: form.name,
        date: new Date(form.date).toISOString(),
        location: form.location,
        description: form.description || null,
      };
      await api("/events/", { method: "POST", body: payload });
      setShowCreate(false);
      setForm({ name: "", date: "", location: "", description: "" });
      onRefresh();
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    setJoinLoading(true);
    setJoinError("");
    try {
      const id = extractEventId(joinValue);
      const event = await api(`/events/${id}`);
      const membership = events.find((e) => e.id === event.id);
      onOpenEvent({ ...event, role: membership ? membership.role : null });
      setJoinValue("");
    } catch (e) {
      setJoinError(e.message);
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Seus Eventos</h1>
          <p className="text-sm text-muted-foreground">
            Abaixo estão os eventos cadastrados em seu nome ou onde você atua na equipe de organização.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <Card className="mb-8 p-5 bg-card border-border">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Link2 className="h-4 w-4 text-primary" /> Acessar Evento por ID
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Caso possua o identificador UUID único de um evento externo, busque-o diretamente aqui.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Cole o ID do evento (ex: 8b4a2e...)"
            value={joinValue}
            onChange={(e) => setJoinValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinValue && handleJoin()}
          />
          <Button variant="outline" onClick={handleJoin} disabled={!joinValue || joinLoading}>
            {joinLoading ? <Spinner /> : <Search className="h-4 w-4" />}
            Buscar
          </Button>
        </div>
        {joinError && (
          <div className="mt-3">
            <Alert tone="error">{joinError}</Alert>
          </div>
        )}
      </Card>

      {eventsError && (
        <div className="mb-4">
          <Alert tone="error">{eventsError}</Alert>
        </div>
      )}

      {eventsLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum evento registrado"
          description="Você ainda não faz parte da organização de nenhum evento no momento."
          action={
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Criar Primeiro Evento
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((ev) => (
            <button key={ev.id} onClick={() => onOpenEvent(ev)} className="w-full text-left group cursor-pointer">
              <Card className="p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{ev.name}</h3>
                  <Badge tone={roleConfig[ev.role].tone}>
                    {roleConfig[ev.role].label}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {formatDateTime(ev.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {ev.location}
                  </div>
                </div>
                {ev.description && (
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground/90 border-t border-border/40 pt-2.5">
                    {ev.description}
                  </p>
                )}
              </Card>
            </button>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Criar Novo Evento">
        <div className="space-y-4">
          <div>
            <Label htmlFor="ev-name">Nome do Evento *</Label>
            <Input
              id="ev-name"
              placeholder="Ex: Workshop de React e Python"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ev-date">Data e Horário *</Label>
            <Input
              id="ev-date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ev-location">Localização / Link *</Label>
            <Input
              id="ev-location"
              placeholder="Ex: Auditório Principal ou URL do Zoom"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ev-description">Descrição Completa</Label>
            <Textarea
              id="ev-description"
              rows={3}
              placeholder="Detalhes sobre a programação, palestrantes, etc..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {createError && <Alert tone="error">{createError}</Alert>}
          <Button className="w-full mt-2" onClick={handleCreate} disabled={creating}>
            {creating && <Spinner />}
            Confirmar e Registrar Evento
          </Button>
        </div>
      </Modal>
    </div>
  );
}

