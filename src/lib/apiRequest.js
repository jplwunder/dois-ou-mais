// ---------------------------------------------------------------------------
// Utilitário centralizado (low-level) para requisições HTTP da API
// ---------------------------------------------------------------------------
import axiosInstance from "./api";

export default async function apiRequest(path, { method = "GET", token, body, form } = {}) {
  const config = {
    method,
    url: path,
    headers: {},
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (form) {
    config.data = new URLSearchParams(body).toString();
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (body !== undefined) {
    config.data = body;
    config.headers["Content-Type"] = "application/json";
  }

  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : detail || `Erro ${error.response.status}`;

      const err = new Error(message);
      err.status = error.response.status;
      throw err;
    } else {
      // Acessa a URL configurada no axios de forma segura para a mensagem de erro
      const currentBaseUrl = axiosInstance.defaults.baseURL || "o servidor";
      const err = new Error(`Não foi possível conectar. Verifique se a API está rodando em ${currentBaseUrl}`);
      err.status = 0;
      throw err;
    }
  }
}