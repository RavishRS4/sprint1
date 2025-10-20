import api from "../lib/api.js";

export const fetchGoals = async () => {
  const { data } = await api.get("/goals");
  return data;
};

export const createGoal = async (payload) => {
  const { data } = await api.post("/goals", payload);
  return data;
};

export const updateGoal = async (id, payload) => {
  const { data } = await api.put(`/goals/${id}`, payload);
  return data;
};

export const deleteGoal = async (id) => {
  const { data } = await api.delete(`/goals/${id}`);
  return data;
};

export const addContribution = async (id, payload) => {
  const { data } = await api.post(`/goals/${id}/contributions`, payload);
  return data;
};

export const fetchContributions = async (id) => {
  const { data } = await api.get(`/goals/${id}/contributions`);
  return data;
};
