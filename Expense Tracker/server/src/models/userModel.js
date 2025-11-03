import { query } from "../config/db.js";

export const createUser = async ({ name, email, passwordHash, salary = 0, role = "user" }) => {
  const sql = `INSERT INTO users (name, email, password_hash, salary, role) VALUES (?, ?, ?, ?, ?)`;
  const params = [name, email, passwordHash, salary, role];
  const result = await query(sql, params);
  return { id: result.insertId, name, email, salary, role };
};

export const findUserByEmail = async (email) => {
  const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
  const rows = await query(sql, [email]);
  return rows[0] ?? null;
};

export const findUserById = async (id) => {
  const sql = `SELECT id, name, email, salary, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1`;
  const rows = await query(sql, [id]);
  return rows[0] ?? null;
};

export const getAllUsers = async () => {
  const sql = `SELECT id, name, email, salary, role, created_at FROM users ORDER BY created_at DESC`;
  return query(sql);
};

export const updateUser = async (id, data) => {
  const fields = [];
  const params = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    params.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    params.push(data.email);
  }
  if (data.salary !== undefined) {
    fields.push("salary = ?");
    params.push(data.salary);
  }
  if (data.passwordHash !== undefined) {
    fields.push("password_hash = ?");
    params.push(data.passwordHash);
  }
  if (data.role !== undefined) {
    fields.push("role = ?");
    params.push(data.role);
  }

  if (!fields.length) {
    return findUserById(id);
  }

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  params.push(id);
  await query(sql, params);
  return findUserById(id);
};

export const deleteUser = async (id) => {
  const sql = `DELETE FROM users WHERE id = ?`;
  await query(sql, [id]);
};
