import api from "../api";
import { getToken } from "../tokenStorage";
const BASE_URL = process.env.REACT_APP_API_BASE || "";

export const uploadMedia = async (file, alt_text = "") => {
  const form = new FormData();
  form.append("file", file);
  if (alt_text) form.append("alt_text", alt_text);

  const res = await api.post("/media", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const listMedia = async ({ q = "", limit = 30, offset = 0 } = {}) => {
  const res = await api.get("/media", { params: { q, limit, offset } });
  return res.data || [];
};

export const deleteMedia = async (id) => {
  const res = await api.delete(`/media/${id}`);
  return res.data;
};

export const refreshMediaCache = async () => {
  const res = await api.post("/media/cache/refresh");
  return res.data;
};

export const mediaUrl = (id) => `${BASE_URL}/api/media/${id}`;

export const fetchMediaBlobUrl = async (id) => {
  const token = getToken();
  const res = await fetch(mediaUrl(id), {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`โหลดไฟล์ไม่สำเร็จ (${res.status}) ${t}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
};