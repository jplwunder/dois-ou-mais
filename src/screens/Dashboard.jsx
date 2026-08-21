import React, { useState } from "react";
import { Calendar, Link2, MapPin, Plus, Search, ChevronDownIcon } from "lucide-react";
import { Modal } from "../components/ui/modal";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { CalendarFunc } from "../components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Field, FieldGroup, FieldLabel } from "../components/ui/field";
import { Alert } from "../components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Separator } from "../components/ui/separator";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle, EmptyMedia } from "../components/ui/empty";
import { Textarea } from "../components/ui/textarea";
import { extractEventId, formatDateTime } from "../lib/utils";

// ---------------------------------------------------------------------------
// Painel Principal (Lista de Eventos)
// ---------------------------------------------------------------------------

export default function Dashboard({ api, events, eventsLoading, eventsError, onRefresh, onOpenEvent }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", date: "",time: "", location: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [joinValue, setJoinValue] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
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

  function formatCustomDateTime(dateObj, timeStr) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  const [hours = "00", minutes = "00"] = (timeStr || "00:00")
    .split(":")
    .map((v) => String(v).padStart(2, "0"));

  return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  async function handleCreate() {
    setCreating(true);
    setCreateError("");
    try {
      if (!form.name || !form.date || !form.time || !form.location) {
        throw new Error("Por favor, informe no mínimo o nome, a data, o horário e o local.");
      }

      const selectedDate = new Date(form.date);
      const [hours, minutes] = form.time.split(":").map(Number);
      selectedDate.setHours(hours, minutes, 0, 0);

      const payload = {
        name: form.name,
        date: formatCustomDateTime(selectedDate, form.time),
        location: form.location,
        description: form.description || null,
      };
      await api("/events/", { method: "POST", body: payload });
      setShowCreate(false);
      setForm({ name: "", date: "", time: "", location: "", description: "" });
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
          <Plus className="h-4 w-4" /> Quer criar o seu Evento?
        </Button>
      </div>

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
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Calendar />
            </EmptyMedia>
          <EmptyTitle>Nenhum evento registrado</EmptyTitle>
          <EmptyDescription>Você ainda não faz parte da organização de nenhum evento no momento.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setShowCreate(true)}>Crie o seu próprio evento</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((ev) => (
            <button key={ev.id} onClick={() => onOpenEvent(ev)} className="w-full text-left group cursor-pointer">
              <Card className="p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-sm">
                <CardHeader className="flex items-center justify-between gap-2">
                  <CardTitle className="font-semibold text-foreground group-hover:text-primary transition-colors">{ev.name}</CardTitle>
                  <Badge tone={roleConfig[ev.role].tone}>
                    {roleConfig[ev.role].label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {formatDateTime(ev.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {ev.location}
                  </div>
                </CardContent>
                {ev.description && (
                  <>
                    <Separator />
                    {ev.description}
                  </>
                )}
              </Card>
            </button>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Criar Novo Evento">
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
            <FieldGroup className="flex flex-row gap-2">
            <Field className="flex-1">
              <FieldLabel htmlFor="ev-date">Data *</FieldLabel>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger
                  id="ev-date"
                  render={
                    <Button
                      id="ev-date"
                      variant="outline"
                      data-empty={form.date ? "false" : "true"}
                      className="w-full justify-between font-normal data-[empty=true]:text-muted-foreground"
                    >
                      {form.date ? format(form.date, "PPP", { locale: ptBR }) : "Selecione a data"}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  }
                />
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <CalendarFunc
                    mode="single"
                    selected={form.date}
                    onSelect={(selectedDate) => {
                      setForm((prev) => ({ ...prev, date: selectedDate }));
                      setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field className="w-32">
              <FieldLabel htmlFor="ev-time">Horário *</FieldLabel>
              <Input
                type="time"
                id="ev-time"
                step="60"
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </Field>
          </FieldGroup>
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
      </Modal>
    </div>
  );
}

