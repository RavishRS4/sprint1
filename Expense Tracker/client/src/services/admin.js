import api from "../lib/api.js";

export const fetchUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data.users;
};

export const updateUserByAdmin = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data.user;
};

export const deleteUserByAdmin = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const fetchAllTransactionsAdmin = async () => {
  const { data } = await api.get("/admin/transactions");
  return data.transactions;
};

export const deleteTransactionAdmin = async (id) => {
  const { data } = await api.delete(`/admin/transactions/${id}`);
  return data;
};

export const fetchUserFinancialOverview = async (id) => {
  const { data } = await api.get(`/admin/users/${id}/overview`);
  return data;
};
