import { query } from "../config/db.js";

export const invalidateActiveTokensForUser = async (userId) => {
  const sql = `UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL`;
  await query(sql, [userId]);
};

export const createPasswordResetToken = async ({ userId, token, expiresAt }) => {
  const sql = `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`;
  await query(sql, [userId, token, expiresAt]);
};

export const findValidResetToken = async (token) => {
  const sql = `SELECT * FROM password_reset_tokens WHERE token = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1`;
  const rows = await query(sql, [token]);
  return rows[0] ?? null;
};

export const markResetTokenUsed = async (id) => {
  const sql = `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?`;
  await query(sql, [id]);
};
