import api from "../lib/api.js";

export const downloadMyReport = async () => {
  const response = await api.get("/reports/me", { responseType: "blob" });
  return response.data;
};

export const downloadUserReport = async (id) => {
  const response = await api.get(`/reports/users/${id}`, { responseType: "blob" });
  return response.data;
};
