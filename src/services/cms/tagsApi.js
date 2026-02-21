import api from "../api";

export const listTags = async () => {
  const res = await api.get("/me/tags");
  return res.data || [];
};

export const createTag = async (payload) => {
  const res = await api.post("/me/tags", payload);
  return res.data;
};

export const updateTag = async (id, payload) => {
  const res = await api.put(`/me/tags/${id}`, payload);
  return res.data;
};

export const deleteTag = async (id) => {
  const res = await api.delete(`/me/tags/${id}`);
  return res.data;
};
