import axios from "axios";
import { getToken, clearToken } from "./tokenStorage";

// frontend เรียก /api/... โดยตรง แล้วให้ dev proxy ไปยัง API_BASE จาก .env
const API_BASE = process.env.REACT_APP_API_BASE || "";
const api = axios.create({
  baseURL: API_BASE + "/api",
  timeout: 60_000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) clearToken();
    return Promise.reject(err);
  }
);

export default api;

export const getErrMsg = (err) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  "เกิดข้อผิดพลาด";
