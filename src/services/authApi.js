import { apiFetch } from "./apiClient";

export const login = (payload) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
