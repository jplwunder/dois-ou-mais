import React from "react";
import { CalendarPlus, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui";
import { initials } from "../lib/utils";

// ---------------------------------------------------------------------------
// Componente de Layout Superior: Header
// ---------------------------------------------------------------------------

export function Header({ user, onLogout, onLogoClick }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <button onClick={onLogoClick} className="flex items-center gap-2 group text-left cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <CalendarPlus className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-sm sm:text-base">EventosHub</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Trocar cor tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="mx-1 hidden items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 sm:flex bg-muted/30">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {initials(user.name)}
            </div>
            <span className="text-xs font-medium text-foreground max-w-[120px] truncate">{user.name}</span>
          </div>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-9 w-9" onClick={onLogout} aria-label="Desconectar">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

