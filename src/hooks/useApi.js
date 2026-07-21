import { useCallback } from "react";
import apiRequest from "../lib/apiRequest";

// ---------------------------------------------------------------------------
// API Wrapper: injeta o token nas requisições e desloga automaticamente
// em caso de erro 401 (não autorizado)
// ---------------------------------------------------------------------------
export function useApi(token, onUnauthorized) {
  const api = useCallback(
    (path, opts = {}) =>
      apiRequest(path, { ...opts, token: opts.token !== undefined ? opts.token : token }).catch(
        (e) => {
          if (e.status === 401) {
            onUnauthorized?.();
          }
          throw e;
        }
      ),
    [token, onUnauthorized]
  );

  return api;
}
