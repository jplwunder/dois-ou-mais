import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Estado de Navegação: view atual e evento selecionado
// ---------------------------------------------------------------------------
export function useNavigation() {
  const [view, setView] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openEvent = useCallback((event) => {
    setSelectedEvent(event);
    setView("event");
  }, []);

  const backToDashboard = useCallback(() => {
    setView("dashboard");
    setSelectedEvent(null);
  }, []);

  const reset = useCallback(() => {
    setView("dashboard");
    setSelectedEvent(null);
  }, []);

  return { view, selectedEvent, openEvent, backToDashboard, reset };
}
