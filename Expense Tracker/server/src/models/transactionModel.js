import { query } from "../config/db.js";

export const createTransaction = async ({
  userId,
  type,
  category,
  amount,
  description,
  transactionDate
}) => {
  const sql = `INSERT INTO transactions (user_id, type, category, amount, description, transaction_date)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [userId, type, category, amount, description, transactionDate];
  const result = await query(sql, params);
  return { id: result.insertId, userId, type, category, amount, description, transactionDate };
};

export const getTransactionsByUser = async (userId, { category, type, startDate, endDate } = {}) => {
  let sql = `SELECT * FROM transactions WHERE user_id = ?`;
  const params = [userId];

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }
  if (type) {
    sql += ` AND type = ?`;
    params.push(type);
  }
  if (startDate) {
    sql += ` AND transaction_date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    sql += ` AND transaction_date <= ?`;
    params.push(endDate);
  }

  sql += ` ORDER BY transaction_date DESC`;
  return query(sql, params);
};

export const getTransactionById = async (id, userId) => {
  const sql = `SELECT * FROM transactions WHERE id = ? AND user_id = ? LIMIT 1`;
  const rows = await query(sql, [id, userId]);
  return rows[0] ?? null;
};

export const updateTransaction = async (id, userId, data) => {
  const fields = [];
  const params = [];

  if (data.type !== undefined) {
    fields.push("type = ?");
    params.push(data.type);
  }
  if (data.category !== undefined) {
    fields.push("category = ?");
    params.push(data.category);
  }
  if (data.amount !== undefined) {
    fields.push("amount = ?");
    params.push(data.amount);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    params.push(data.description);
  }
  if (data.transactionDate !== undefined) {
    fields.push("transaction_date = ?");
    params.push(data.transactionDate);
  }

  if (!fields.length) {
    return getTransactionById(id, userId);
  }

  const sql = `UPDATE transactions SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  params.push(id, userId);
  await query(sql, params);
  return getTransactionById(id, userId);
};

export const deleteTransaction = async (id, userId) => {
  const sql = `DELETE FROM transactions WHERE id = ? AND user_id = ?`;
  await query(sql, [id, userId]);
};

export const deleteTransactionById = async (id) => {
  const sql = `DELETE FROM transactions WHERE id = ?`;
  await query(sql, [id]);
};

export const getDashboardSummary = async (userId) => {
  const incomeSql = `SELECT IFNULL(SUM(amount), 0) AS total_income FROM transactions WHERE user_id = ? AND type = 'income'`;
  const expenseSql = `SELECT IFNULL(SUM(amount), 0) AS total_expense FROM transactions WHERE user_id = ? AND type = 'expense'`;
  const monthlySavingsSql = `SELECT DATE_FORMAT(transaction_date, '%Y-%m') AS month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM transactions
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6`;

  const [incomeRows, expenseRows, monthlyRows] = await Promise.all([
    query(incomeSql, [userId]),
    query(expenseSql, [userId]),
    query(monthlySavingsSql, [userId])
  ]);

  const totalIncome = incomeRows[0]?.total_income ?? 0;
  const totalExpense = expenseRows[0]?.total_expense ?? 0;
  const balance = totalIncome - totalExpense;

  const monthlySavings = monthlyRows
    .map((row) => ({
      month: row.month,
      income: Number(row.income ?? 0),
      expense: Number(row.expense ?? 0),
      savings: Number((row.income ?? 0) - (row.expense ?? 0))
    }))
    .reverse();

  return {
    totalIncome: Number(totalIncome),
    totalExpense: Number(totalExpense),
    balance: Number(balance),
    monthlySavings
  };
};

export const getCategoryBreakdown = async (userId, { startDate, endDate } = {}) => {
  let sql = `SELECT category,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
    FROM transactions
    WHERE user_id = ?`;
  const params = [userId];

  if (startDate) {
    sql += ` AND transaction_date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    sql += ` AND transaction_date <= ?`;
    params.push(endDate);
  }

  sql += ` GROUP BY category ORDER BY category`;
  const rows = await query(sql, params);

  return rows.map((row) => ({
    category: row.category,
    income: Number(row.total_income ?? 0),
    expense: Number(row.total_expense ?? 0)
  }));
};

export const getAllTransactionsWithUsers = async () => {
  const sql = `SELECT t.*, u.name AS user_name, u.email AS user_email
               FROM transactions t
               INNER JOIN users u ON u.id = t.user_id
               ORDER BY t.created_at DESC`;
  return query(sql);
};

export const getTransactionByIdAdmin = async (id) => {
  const sql = `SELECT t.*, u.name AS user_name, u.email AS user_email
               FROM transactions t
               INNER JOIN users u ON u.id = t.user_id
               WHERE t.id = ?
               LIMIT 1`;
  const rows = await query(sql, [id]);
  return rows[0] ?? null;
};
