import React from "react";
import { AlertCircle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { Card } from "./card";

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

