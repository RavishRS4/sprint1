import { query } from "../config/db.js";

export const createGoal = async ({ userId, name, targetAmount, description, endDate }) => {
  const sql = `INSERT INTO goals (user_id, name, target_amount, description, end_date)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [userId, name, targetAmount, description, endDate];
  const result = await query(sql, params);
  return getGoalById(result.insertId, userId);
};

export const getGoalsByUser = async (userId) => {
  const sql = `SELECT g.*, IFNULL(SUM(gc.amount), 0) AS saved_amount
               FROM goals g
               LEFT JOIN goal_contributions gc ON gc.goal_id = g.id
               WHERE g.user_id = ?
               GROUP BY g.id
               ORDER BY g.created_at DESC`;
  return query(sql, [userId]);
};

export const getGoalById = async (id, userId) => {
  const sql = `SELECT g.*, IFNULL(SUM(gc.amount), 0) AS saved_amount
               FROM goals g
               LEFT JOIN goal_contributions gc ON gc.goal_id = g.id
               WHERE g.id = ? AND g.user_id = ?
               GROUP BY g.id
               LIMIT 1`;
  const rows = await query(sql, [id, userId]);
  return rows[0] ?? null;
};

export const updateGoal = async (id, userId, data) => {
  const fields = [];
  const params = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    params.push(data.name);
  }
  if (data.targetAmount !== undefined) {
    fields.push("target_amount = ?");
    params.push(data.targetAmount);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    params.push(data.description);
  }
  if (data.endDate !== undefined) {
    fields.push("end_date = ?");
    params.push(data.endDate);
  }
  if (data.status !== undefined) {
    fields.push("status = ?");
    params.push(data.status);
  }

  if (!fields.length) {
    return getGoalById(id, userId);
  }

  const sql = `UPDATE goals SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  params.push(id, userId);
  await query(sql, params);
  return getGoalById(id, userId);
};

export const deleteGoal = async (id, userId) => {
  const sql = `DELETE FROM goals WHERE id = ? AND user_id = ?`;
  await query(sql, [id, userId]);
};

export const addGoalContribution = async ({ goalId, amount, contributionDate }) => {
  const sql = `INSERT INTO goal_contributions (goal_id, amount, contribution_date)
               VALUES (?, ?, ?)`;
  const params = [goalId, amount, contributionDate];
  const result = await query(sql, params);
  return {
    id: result.insertId,
    goalId,
    amount,
    contributionDate
  };
};

export const getGoalContributions = async (goalId, userId) => {
  const sql = `SELECT gc.*
               FROM goal_contributions gc
               INNER JOIN goals g ON g.id = gc.goal_id
               WHERE gc.goal_id = ? AND g.user_id = ?
               ORDER BY gc.contribution_date DESC`;
  return query(sql, [goalId, userId]);
};

export const getContributionById = async (id, userId) => {
  const sql = `SELECT gc.*
               FROM goal_contributions gc
               INNER JOIN goals g ON g.id = gc.goal_id
               WHERE gc.id = ? AND g.user_id = ?
               LIMIT 1`;
  const rows = await query(sql, [id, userId]);
  return rows[0] ?? null;
};

export const updateGoalContribution = async (id, userId, { amount, contributionDate }) => {
  const sql = `UPDATE goal_contributions SET amount = ?, contribution_date = ? WHERE id = ?`;
  await query(sql, [amount, contributionDate, id]);
  return getContributionById(id, userId);
};
