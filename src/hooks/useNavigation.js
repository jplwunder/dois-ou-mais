import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Estado de Navegação: view atual (dashboard | profile).
// A página de evento é pública e vive na rota /evento/:id (ver App.jsx).
// ---------------------------------------------------------------------------
export function useNavigation() {
  const [view, setView] = useState("dashboard");

  const backToDashboard = useCallback(() => {
    setView("dashboard");
  }, []);

  const toProfile = useCallback(() => {
    setView("profile");
  }, []);

  const reset = useCallback(() => {
    setView("dashboard");
  }, []);

  return { view, backToDashboard, reset, toProfile };
}
