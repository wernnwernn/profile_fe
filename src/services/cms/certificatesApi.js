import api from "../api";

export const listCertificates = async () => {
  const res = await api.get("/me/certificates");
  return res.data || [];
};

export const createCertificate = async (payload) => {
  const res = await api.post("/me/certificates", payload);
  return res.data;
};

export const updateCertificate = async (id, payload) => {
  const res = await api.put(`/me/certificates/${id}`, payload);
  return res.data;
};

export const deleteCertificate = async (id) => {
  const res = await api.delete(`/me/certificates/${id}`);
  return res.data;
};

export const reorderCertificates = async (orderedIds) => {
  const res = await api.post("/me/certificates/reorder", { orderedIds });
  return res.data;
};
