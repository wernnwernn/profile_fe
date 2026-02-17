import api from "../api";

export const listExperiences = async () => {
  const res = await api.get("/me/experiences");
  return res.data || [];
};

export const createExperience = async (payload) => {
  const res = await api.post("/me/experiences", payload);
  return res.data;
};

export const updateExperience = async (id, payload) => {
  const res = await api.put(`/me/experiences/${id}`, payload);
  return res.data;
};

export const deleteExperience = async (id) => {
  const res = await api.delete(`/me/experiences/${id}`);
  return res.data;
};

export const reorderExperiences = async (orderedIds) => {
  const res = await api.post("/me/experiences/reorder", { orderedIds });
  return res.data;
};

// highlights
export const createHighlight = async (payload) => {
  const res = await api.post("/me/experience-highlights", payload);
  return res.data;
};

export const updateHighlight = async (id, payload) => {
  const res = await api.put(`/me/experience-highlights/${id}`, payload);
  return res.data;
};

export const deleteHighlight = async (id) => {
  const res = await api.delete(`/me/experience-highlights/${id}`);
  return res.data;
};

export const reorderHighlights = async (experience_id, orderedIds) => {
  const res = await api.post("/me/experience-highlights/reorder", { experience_id, orderedIds });
  return res.data;
};
