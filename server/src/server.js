import dotenv from "dotenv";
import app from "./app.js";
import { ensureDatabaseConnection } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

await ensureDatabaseConnection();

app.listen(PORT, () => {
  console.log(`Expense Tracker server running on port ${PORT}`);
});
