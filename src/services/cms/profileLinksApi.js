import api from "../api";

export const listProfileLinks = async () => {
  const res = await api.get("/me/profile-links");
  return res.data || [];
};

export const createProfileLink = async (payload) => {
  const res = await api.post("/me/profile-links", payload);
  return res.data;
};

export const updateProfileLink = async (id, payload) => {
  const res = await api.put(`/me/profile-links/${id}`, payload);
  return res.data;
};

export const deleteProfileLink = async (id) => {
  const res = await api.delete(`/me/profile-links/${id}`);
  return res.data;
};

export const reorderProfileLinks = async (orderedIds) => {
  const res = await api.post("/me/profile-links/reorder", { orderedIds });
  return res.data;
};
