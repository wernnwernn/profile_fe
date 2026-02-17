import { getToken, clearToken } from "./tokenStorage";

const API_BASE = process.env.REACT_APP_API_BASE || "";
export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // ถ้า token หมดอายุ
  if (res.status === 401) {
    clearToken();
  }

  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) {
    const msg = json?.error || json?.message || `HTTP_${res.status}`;
    throw new Error(msg);
  }

  return json;
};
