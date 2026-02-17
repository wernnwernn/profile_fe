import api from "../api";

export const listProjects = async () => {
  const res = await api.get("/me/projects");
  return res.data || [];
};

export const createProject = async (payload) => {
  const res = await api.post("/me/projects", payload);
  return res.data;
};

export const updateProject = async (id, payload) => {
  const res = await api.put(`/me/projects/${id}`, payload);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await api.delete(`/me/projects/${id}`);
  return res.data;
};

export const reorderProjects = async (orderedIds) => {
  const res = await api.post("/me/projects/reorder", { orderedIds });
  return res.data;
};

// media
export const addProjectMedia = async (projectId, payload) => {
  const res = await api.post(`/me/projects/${projectId}/media`, payload);
  return res.data;
};

export const updateProjectMedia = async (id, payload) => {
  const res = await api.put(`/me/project-media/${id}`, payload);
  return res.data;
};

export const deleteProjectMedia = async (id) => {
  const res = await api.delete(`/me/project-media/${id}`);
  return res.data;
};

export const reorderProjectMedias = async (projectId, orderedIds) => {
  const res = await api.post(`/me/projects/${projectId}/media/reorder`, { orderedIds });
  return res.data;
};

// tags
export const setProjectTags = async (projectId, tagIds) => {
  const res = await api.post(`/me/projects/${projectId}/tags`, { tagIds });
  return res.data;
};
