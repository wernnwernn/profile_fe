import api from "../api";

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

export const mediaUrl = (id) => `/api/media/${id}`;
