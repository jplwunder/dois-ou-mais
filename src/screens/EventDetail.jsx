import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  Info,
  MapPin,
  ScanLine,
  Shield,
  ShieldCheck,
  Ticket as TicketIcon,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert } from "../components/ui/alert";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import { Empty, EmptyDescription, EmptyTitle } from "../components/ui/empty";
import { TicketStub } from "../components/TicketStub";
import { extractEventId ,formatDateTime, initials } from "../lib/utils";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { useNavigation } from "../hooks/useNavigation";
import { useEvents } from "../hooks/useEvents";

// ---------------------------------------------------------------------------
// Detalhes do Evento (Abas: Visão Geral, Ingressos, Equipe, Check-in)
// ---------------------------------------------------------------------------

export default function EventDetail({ api, event, currentUser, onBack, onDeleted }) {
  const isAdmin = event.role === "admin";
  const isStaffOrAdmin = event.role === "admin" || event.role === "staff";

  const [tab, setTab] = useState("overview");

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [usersCache, setUsersCache] = useState({});

  const [myTicket, setMyTicket] = useState(null);
  const [ticketActionLoading, setTicketActionLoading] = useState(false);
  const [ticketActionError, setTicketActionError] = useState("");

  const [organizers, setOrganizers] = useState(null);
  const [organizersLoading, setOrganizersLoading] = useState(false);
  const [organizersError, setOrganizersError] = useState("");

  const [staffEmail, setStaffEmail] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMsg, setStaffMsg] = useState(null);

  const [checkinCode, setCheckinCode] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);

  const [checkinLogs, setCheckinLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError("");
    try {
      if (!event?.id) throw new Error("Evento inválido");
      const data = await api(`/attendees/participants/${event.id}`);
      setTickets(data.tickets);
      const mine = data.tickets.find((t) => t.attendee_id === currentUser.id);
      if (mine) setMyTicket(mine);
    } catch (e) {
      setTicketsError(e.message);
    } finally {
      setTicketsLoading(false);
    }
  }, [api, event?.id, currentUser.id]);

  useEffect(() => {
    if (!event?.id) return;
    loadTickets();
  }, [loadTickets]);

  // Busca e cacheia informações de usuários em segundo plano baseando-se no attendee_id
  useEffect(() => {
    const missing = [...new Set(tickets.map((t) => t.attendee_id))].filter(
      (id) => !usersCache[id]
    );
    if (missing.length === 0) return;
    let isMounted = true;
    Promise.allSettled(missing.map((id) => api(`/users/${id}`))).then((results) => {
      if (!isMounted) return;
      setUsersCache((prev) => {
        const next = { ...prev };
        results.forEach((r, idx) => {
          if (r.status === "fulfilled") next[missing[idx]] = r.value;
        });
        return next;
      });
    });
    return () => { isMounted = false; };
  }, [tickets, usersCache, api]);

  const loadCheckInLogs = useCallback(async () => {
    if (!event?.id || !myTicket?.ticket_code) return;
    setLogsLoading(true);
    try {
    // Rota que busca os logs de check-in deste evento
    // (Ajuste o endpoint de acordo com a rota do seu backend, ex: /events/{id}/check-in-logs)
      const data = await api(`/events/${event.id}/check-in-logs?ticket_code=${encodeURIComponent(myTicket.ticket_code)}`);
      setCheckinLogs(data.logs ?? []);
      } catch (e) {
      console.error("Erro ao carregar logs de check-in:", e.message);
      } finally {
      setLogsLoading(false);
    }
  }, [api, event.id, myTicket]);

  // Carrega os logs ao selecionar a aba de check-in
  useEffect(() => {
    if (tab === "checkin" && isStaffOrAdmin) {
      loadCheckInLogs();
    }
  }, [tab, isStaffOrAdmin, loadCheckInLogs]);

  // Modifique a função handleCheckIn para recarregar os logs logo após uma validação bem-sucedida
  async function handleCheckIn() {
    if (!checkinCode) return;
    setCheckinLoading(true);
    setCheckinResult(null);
    try {
      const data = await api(`/events/${event.id}/check-in/${checkinCode.trim()}`, { method: "POST" });
      setCheckinResult({ tone: "success", text: data.message });
      setCheckinCode("");
    
    // Atualiza os dados na tela
      loadTickets();
      loadCheckInLogs(); 
    } catch (e) {
      setCheckinResult({ tone: "error", text: e.message });
    } finally {
      setCheckinLoading(false);
    }
  }

  async function handleGetTicket() {
    setTicketActionLoading(true);
    setTicketActionError("");
    try {
      const data = await api(`/attendees/tickets?event_id=${encodeURIComponent(event.id)}`, { method: "POST" });
      setMyTicket(data.ticket);
      setTickets((prev) => [...prev, data.ticket]);
    } catch (e) {
      setTicketActionError(e.message);
    } finally {
      setTicketActionLoading(false);
    }
  }

  async function loadOrganizers() {
    if (!myTicket) return;
    setOrganizersLoading(true);
    setOrganizersError("");
    try {
      const data = await api(
        `/attendees/organizers/${event.id}?ticket_code=${encodeURIComponent(myTicket.ticket_code)}`
      );
      const organizersList = data.users.filter((t) => t.role === "admin" || t.role === "staff");
      setOrganizers(organizersList);
    } catch (e) {
      setOrganizersError(e.message);
    } finally {
      setOrganizersLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "team" && isStaffOrAdmin && myTicket && organizers === null) {
      loadOrganizers();
    }
  }, [tab, myTicket, organizers, isStaffOrAdmin]);

  async function handleAddStaff() {
    if (!myTicket) return;
    setStaffLoading(true);
    setStaffMsg(null);
    try {
      const targetUser = await api(`/users/by-email/${encodeURIComponent(staffEmail)}`);
      await api(
        `/events/${event.id}/addstaff/${targetUser.id}?ticket_code=${encodeURIComponent(
          myTicket.ticket_code
        )}`,
        { method: "POST" }
      );
      setStaffMsg({ tone: "success", text: `${targetUser.name} adicionado à equipe organizacional!` });
      setStaffEmail("");
      setOrganizers(null);
      loadOrganizers();
    } catch (e) {
      setStaffMsg({ tone: "error", text: e.message });
    } finally {
      setStaffLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!checkinCode) return;
    setCheckinLoading(true);
    setCheckinResult(null);
    try {
      const data = await api(`/events/${event.id}/check-in/${checkinCode.trim()}`, { method: "POST" });
      setCheckinResult({ tone: "success", text: data.message });
      setCheckinCode("");
      loadTickets();
    } catch (e) {
      setCheckinResult({ tone: "error", text: e.message });
    } finally {
      setCheckinLoading(false);
    }
  }



  async function handleDeleteEvent() {
    if (!myTicket) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await api(`/events/${event.id}?ticket_code=${encodeURIComponent(myTicket.ticket_code)}`, {
        method: "DELETE",
      });
      onDeleted(event.id);
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  }


  const tabList = useMemo(() => {
    const items = [
      { id: "overview", label: "Visão Geral", icon: Info },
      { id: "ticket", label: "Meu Ingresso", icon: TicketIcon }
    ];
    if (isStaffOrAdmin) {
      items.push({ id: "participants", label: "Inscritos", icon: Users });
      items.push({ id: "team", label: "Organizadores", icon: ShieldCheck });
      items.push({ id: "checkin", label: "Portaria & Check-in", icon: ScanLine });
    }
    return items;
  }, [isStaffOrAdmin]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Painel Geral
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
            {event.role && (
              <Badge tone={isAdmin ? "admin" : "staff"}>
                {isAdmin ? "Dono / Admin" : "Membro Staff"}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {formatDateTime(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {event.location}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col items-end gap-1.5">
            {!confirmDelete ? (
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 text-destructive" /> Excluir Evento
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-1.5">
                <span className="text-xs text-foreground font-medium pl-1">Excluir para sempre?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteEvent}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? <Spinner /> : "Sim"}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setConfirmDelete(false)}>
                  Não
                </Button>
              </div>
            )}
            {deleteError && <p className="text-xs text-destructive font-medium mt-1">{deleteError}</p>}
          </div>
        )}
      </div>

      {event.description && (
        <Card className="mb-6 p-4 bg-muted/30">
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{event.description}</p>
        </Card>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 border border-border/30">
        {tabList.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              tab === t.id
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">Métricas e Detalhes</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div className="border-l-2 border-primary pl-3">
              <dt className="text-xs text-muted-foreground font-medium">Inscritos Totais</dt>
              <dd className="mt-0.5 text-xl font-bold text-foreground">{tickets.length}</dd>
            </div>
            <div className="border-l-2 border-emerald-500 pl-3">
              <dt className="text-xs text-muted-foreground font-medium">Presenças (Check-in)</dt>
              <dd className="mt-0.5 text-xl font-bold text-foreground">
                {tickets.filter((t) => t.checked_in).length}
              </dd>
            </div>
            <div className="col-span-2 border-l-2 border-neutral-300 dark:border-neutral-700 pl-3 sm:col-span-1">
              <dt className="text-xs text-muted-foreground font-medium">ID do Evento</dt>
              <dd className="mt-1 break-all font-mono text-[11px] text-foreground font-semibold bg-muted p-1 rounded">
                {event.id}
              </dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <p>
              Divulgue o UUID estruturado acima. Qualquer usuário da plataforma pode utilizá-lo na área de buscas do painel para se inscrever ou cooperar.
            </p>
          </div>
        </Card>
      )}

      {tab === "ticket" && (
        <div className="space-y-4 max-w-md mx-auto">
          {isAdmin ? (
            <Empty>
              <ShieldCheck />
              <EmptyTitle>Você é o Organizador Principal</EmptyTitle>
              <EmptyDescription>Como criador deste evento, você possui credenciais administrativas totais. Não é necessário emitir um ingresso de participação para você.</EmptyDescription>
            </Empty>
          ) : myTicket ? (
            <TicketStub
              eventName={event.name}
              holderName={currentUser.name}
              code={myTicket.ticket_code}
              checkedIn={myTicket.checked_in}
            />
          ) : (
            <Empty>
              <TicketIcon />
              <EmptyTitle>Você não tem um bilhete de inscrição</EmptyTitle>
              <EmptyDescription>Para participar da lista oficial de presença, emita seu convite individual.</EmptyDescription>
                <Button onClick={handleGetTicket} disabled={ticketActionLoading}>
                  {ticketActionLoading && <Spinner />}
                  Emitir Meu Ingresso Gratuitamente
                </Button>
            </Empty>
          )}
          {ticketActionError && <Alert tone="error">{ticketActionError}</Alert>}
        </div>
      )}
      {tab === "participants" && isStaffOrAdmin && (
        <Card className="overflow-hidden">
          {ticketsLoading ? (
            <div className="flex justify-center py-14">
              <Spinner className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : ticketsError ? (
            <div className="p-4">
              <Alert tone="error">{ticketsError}</Alert>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-4">
              <Empty> <Users /> <EmptyTitle>A lista está vazia</EmptyTitle> <EmptyDescription>Nenhum usuário emitiu ingressos para este evento até o momento.</EmptyDescription></Empty>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {tickets.map((t) => {
                const person = usersCache[t.attendee_id];
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 bg-card hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground border border-border">
                        {initials(person?.name || "?")}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {person?.name || <span className="text-muted-foreground animate-pulse">Carregando dados...</span>}
                        </p>
                        {person?.email && <p className="text-[11px] text-muted-foreground">{person.email}</p>}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {t.cancelled ? (
                        <Badge tone="danger">Cancelado</Badge>
                      ) : t.checked_in ? (
                        <Badge tone="success">Confirmado</Badge>
                      ) : (
                        <Badge tone="warn">Não Compareceu</Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {tab === "team" && isStaffOrAdmin && (
        <div className="space-y-6">
          {!myTicket ? (
            <Empty>
              <ShieldCheck />
              <EmptyTitle>Liberação Necessária</EmptyTitle>
              <EmptyDescription>A verificação estruturada e inserção de novos membros da equipe requer a posse de um convite ativo atrelado à sua conta.</EmptyDescription>
                <Button size="sm" onClick={handleGetTicket} disabled={ticketActionLoading}>
                  {ticketActionLoading && <Spinner />}
                  Vincular Meu Acesso Primeiro
                </Button>
            </Empty>
          ) : (
            <>
              {isAdmin && (
                <Card className="p-5">
                  <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <UserPlus className="h-4 w-4 text-primary" /> Recrutar Organizador
                  </h3>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Digite o endereço eletrônico exato de um usuário cadastrado no sistema para delegar permissões Staff.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      type="email"
                      placeholder="parceiro@email.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && staffEmail && handleAddStaff()}
                    />
                    <Button onClick={handleAddStaff} disabled={!staffEmail || staffLoading}>
                      {staffLoading ? <Spinner /> : <UserPlus className="h-4 w-4" />}
                      Promover
                    </Button>
                  </div>
                  {staffMsg && (
                    <div className="mt-3">
                      <Alert tone={staffMsg.tone}>{staffMsg.text}</Alert>
                    </div>
                  )}
                </Card>
              )}

              <Card className="overflow-hidden">
                <div className="border-b border-border bg-muted/40 px-5 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Corpo Organizacional</h3>
                </div>
                {organizersLoading ? (
                  <div className="flex justify-center py-14">
                    <Spinner className="h-5 w-5 text-muted-foreground" />
                  </div>
                ) : organizersError ? (
                  <div className="p-4">
                    <Alert tone="error">{organizersError}</Alert>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {(organizers || []).map((org) => (
                      <li key={org.id} className="flex items-center justify-between px-5 py-3 text-xs bg-card">
                        <span className="font-mono text-foreground font-semibold">{org.email}</span>
                        <Badge tone={org.role === "admin" ? "admin" : "staff"}>
                          {org.role === "admin" ? "Dono" : "Staff Colaborador"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}
        </div>
      )}
  {tab === "checkin" && isStaffOrAdmin && (
    <div className="grid gap-6 md:grid-cols-5 max-w-5xl mx-auto">
      {/* Formulário de Leitura / Entrada (Colunas: 2 de 5) */}
      <div className="md:col-span-2">
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ScanLine className="h-4 w-4 text-primary" /> Validar Entrada
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Insira o código alfanumérico do canhoto do ingresso apresentado pelo participante para registrar a presença imediata.
          </p>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Código do Ingresso (ex: TKT-123456)"
              value={checkinCode || ""}
              onChange={(e) => setCheckinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkinCode && handleCheckIn()}
              className="font-mono uppercase placeholder:normal-case tracking-wider"
            />
            <Button className="w-full" onClick={handleCheckIn} disabled={!checkinCode || checkinLoading}>
              {checkinLoading ? <Spinner /> : <ScanLine className="h-4 w-4" />}
              Dar Check-in
            </Button>
          </div>
          {checkinResult && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <Alert tone={checkinResult.tone}>{checkinResult.text}</Alert>
            </div>
          )}
        </Card>
      </div>

      {/* Histórico/Log de Check-ins (Colunas: 3 de 5) */}
      <div className="md:col-span-3">
        <Card className="overflow-hidden h-[400px] flex flex-col">
          <div className="border-b border-border bg-muted/40 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Fluxo de Entrada em Tempo Real
              </h3>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={loadCheckInLogs} disabled={logsLoading}>
              {logsLoading ? <Spinner /> : "Atualizar"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {logsLoading && (!checkinLogs || checkinLogs.length === 0) ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="h-6 w-6 text-muted-foreground" />
              </div>
            ) : (!checkinLogs || checkinLogs.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhum check-in realizado ainda</p>
                <p className="text-xs max-w-[240px] mx-auto mt-1">
                  As entradas validadas aparecerão aqui listando quem liberou o acesso.
                </p>
              </div>
            ) : (
              checkinLogs.map((log) => {
                // Formatação segura da data caso formatDateTime não esteja escopado
                const dataFormatada = log?.checked_at 
                  ? new Date(log.checked_at).toLocaleString('pt-BR') 
                  : "Data pendente";

                return (
                  <div key={log?.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between gap-4 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                        {log?.ticket_code || "Ingresso n/a"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Participante: <span className="font-semibold text-foreground">{log?.attendee_name || "Desconhecido"}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                        Operador: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[9px]">
                          {log?.checked_by_name || "Sistema"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge tone="success" className="text-[10px] py-0.5 px-2">Liberado</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {dataFormatada}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )}
</div>
  );
}


