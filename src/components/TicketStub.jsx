import React, { useState } from "react";
import { Check, CheckCircle2, Copy, Ticket as TicketIcon } from "lucide-react";
import { Badge } from "../components/ui/badge";

export function TicketStub({ eventName, holderName, code, checkedIn }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Falha silenciosa se clipboard não estiver disponível
    }
  }

  return (
    <div className="relative flex w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary-foreground/70">
          <TicketIcon className="h-3.5 w-3.5" />
          Ingresso
        </div>
        <p className="mt-2 text-lg font-semibold leading-tight">{eventName}</p>
        <p className="text-sm text-primary-foreground/85 mt-0.5">{holderName}</p>
        <div className="mt-4">
          {checkedIn ? (
            <Badge className="bg-white/20 text-primary-foreground">
              <CheckCircle2 className="h-3 w-3" /> Presença Confirmada
            </Badge>
          ) : (
            <Badge className="bg-white/10 text-primary-foreground border border-white/20">
              Aguardando Check-in
            </Badge>
          )}
        </div>
      </div>
      <div className="relative flex w-32 shrink-0 flex-col items-center justify-center gap-2 border-l border-dashed border-primary-foreground/30 px-3 py-4 bg-black/5">
        <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-background" />
        <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-background" />
        <p className="break-all text-center font-mono text-[10px] uppercase tracking-wider text-primary-foreground/90">
          {code}
        </p>
        <button
          onClick={handleCopy}
          className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-white/25 cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

