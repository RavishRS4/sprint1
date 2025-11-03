import "./env.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (sql, params) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const ensureDatabaseConnection = async () => {
  try {
    await query("SELECT 1");
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Unable to connect to the database", error.message);
    throw error;
  }
};

export default pool;
