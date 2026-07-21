import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Estado de Autenticação: token, usuário atual e handlers de login/logout
// ---------------------------------------------------------------------------
export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("ev_token"));
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("ev_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((newToken, user) => {
    localStorage.setItem("ev_token", newToken);
    localStorage.setItem("ev_user", JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ev_token");
    localStorage.removeItem("ev_user");
    setToken(null);
    setCurrentUser(null);
  }, []);

  return { token, currentUser, login, logout };
}
