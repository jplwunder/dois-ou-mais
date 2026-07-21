import { useState, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// Estado Global de Eventos: lista de eventos, loading, erro e refreshEvents()
// ---------------------------------------------------------------------------
export function useEvents(api, token) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/events/");
      setEvents(data.events);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (token) {
      refreshEvents();
    }
  }, [token, refreshEvents]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, loading, error, refreshEvents, clearEvents };
}
