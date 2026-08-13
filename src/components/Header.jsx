import React from "react";
import { CalendarPlus, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
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
        <Button variant="ghost" onClick={onLogoClick} className="flex items-center gap-2 group text-left cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <CalendarPlus className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-sm sm:text-base">EventosHub</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            variant="ghost"
            aria-label="Trocar cor tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={initials(user.name)} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <Label>{user.name}</Label>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-9 w-9" onClick={onLogout} aria-label="Desconectar">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

