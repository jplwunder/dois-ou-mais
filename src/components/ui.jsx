import React from "react";
import { AlertCircle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Componentes de Interface (Baseados nas classes utilitárias do index.css)
// ---------------------------------------------------------------------------

export function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none cursor-pointer";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
    outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
    ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-white hover:opacity-90",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
    icon: "h-9 w-9",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    />
  );
}

export function Label({ children, ...props }) {
  return (
    <label {...props} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ tone = "default", className = "", children }) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    admin: "bg-primary text-primary-foreground",
    staff: "bg-foreground/10 text-foreground",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = "h-4 w-4" }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function Alert({ tone = "error", children }) {
  const tones = {
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    info: "border-primary/30 bg-primary/10 text-primary",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertCircle;
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Info, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

