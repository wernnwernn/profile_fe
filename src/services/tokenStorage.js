const KEY = "profile_token";

export const getToken = () => localStorage.getItem(KEY) || "";
export const setToken = (t) => localStorage.setItem(KEY, String(t || ""));
export const clearToken = () => localStorage.removeItem(KEY);
