import api from "../api";

export const listEducations = async () => {
  const res = await api.get("/me/educations");
  return res.data || [];
};

export const createEducation = async (payload) => {
  const res = await api.post("/me/educations", payload);
  return res.data;
};

export const updateEducation = async (id, payload) => {
  const res = await api.put(`/me/educations/${id}`, payload);
  return res.data;
};

export const deleteEducation = async (id) => {
  const res = await api.delete(`/me/educations/${id}`);
  return res.data;
};

export const reorderEducations = async (orderedIds) => {
  const res = await api.post("/me/educations/reorder", { orderedIds });
  return res.data;
};
