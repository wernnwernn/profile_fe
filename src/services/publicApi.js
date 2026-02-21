import { apiFetch } from "./apiClient";

export const getHealth = () => apiFetch("/api/health");

export const fetchPublicProfileFull = (slug) =>
  apiFetch(`/api/public/profiles/${encodeURIComponent(slug)}/full`);

export const register = (payload) =>
  apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const publicLogin = (payload) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

