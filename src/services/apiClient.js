import axios from "axios";
import { getToken, clearToken } from "./tokenStorage";

const API_BASE = process.env.REACT_APP_API_BASE || "";

export const apiFetch = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const axiosConfig = {
      url: `${API_BASE}${path}`,
      method: options.method || "GET",
      headers,
    };

    if (options.body !== undefined) {
      let data = options.body;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
        }
      }
      axiosConfig.data = data;
    }

    const res = await axios(axiosConfig);
    return res.data ?? null;
  } catch (err) {
    const status = err?.response?.status;

    if (status === 401) {
      clearToken();
    }

    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      (status ? `HTTP_${status}` : "Request failed");

    throw new Error(msg);
  }
};
