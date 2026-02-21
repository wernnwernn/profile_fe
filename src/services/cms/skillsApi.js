import api from "../api";

export const listSkills = async () => {
  const res = await api.get("/me/skills");
  return res.data || [];
};

export const createSkill = async (payload) => {
  const res = await api.post("/me/skills", payload);
  return res.data;
};

export const updateSkill = async (id, payload) => {
  const res = await api.put(`/me/skills/${id}`, payload);
  return res.data;
};

export const deleteSkill = async (id) => {
  const res = await api.delete(`/me/skills/${id}`);
  return res.data;
};

export const reorderSkills = async (orderedIds) => {
  const res = await api.post("/me/skills/reorder", { orderedIds });
  return res.data;
};
