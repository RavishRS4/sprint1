import ExcelJS from "exceljs";
import { getDashboardSummary, getTransactionsByUser, getCategoryBreakdown } from "../models/transactionModel.js";
import { getGoalsByUser } from "../models/goalModel.js";
import { findUserById } from "../models/userModel.js";

const createWorkbook = ({ user, summary, transactions, goals, categories }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BudgetMate";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 25 },
    { header: "Value", key: "value", width: 20 }
  ];

  summarySheet.addRows([
    { metric: "User", value: user.name },
    { metric: "Email", value: user.email },
    { metric: "Total Income", value: Number(summary.totalIncome || 0) },
    { metric: "Total Expense", value: Number(summary.totalExpense || 0) },
    { metric: "Current Balance", value: Number(summary.balance || 0) },
    { metric: "Salary", value: Number(user.salary || 0) }
  ]);

  summarySheet.getColumn("value").numFmt = "₹#,##0.00";

  const monthlySheet = workbook.addWorksheet("Monthly Savings");
  monthlySheet.columns = [
    { header: "Month", key: "month", width: 15 },
    { header: "Income", key: "income", width: 15, style: { numFmt: "₹#,##0.00" } },
    { header: "Expense", key: "expense", width: 15, style: { numFmt: "₹#,##0.00" } },
    { header: "Savings", key: "savings", width: 15, style: { numFmt: "₹#,##0.00" } }
  ];
  summary.monthlySavings?.forEach((row) => monthlySheet.addRow(row));

  const categorySheet = workbook.addWorksheet("Category Breakdown");
  categorySheet.columns = [
    { header: "Category", key: "category", width: 20 },
    { header: "Total Income", key: "income", width: 18, style: { numFmt: "₹#,##0.00" } },
    { header: "Total Expense", key: "expense", width: 18, style: { numFmt: "₹#,##0.00" } }
  ];
  categories.forEach((category) => categorySheet.addRow(category));

  const transactionSheet = workbook.addWorksheet("Transactions");
  transactionSheet.columns = [
    { header: "Date", key: "transaction_date", width: 18 },
    { header: "Type", key: "type", width: 12 },
    { header: "Category", key: "category", width: 18 },
    { header: "Amount", key: "amount", width: 15, style: { numFmt: "₹#,##0.00" } },
    { header: "Description", key: "description", width: 30 }
  ];

  transactions.forEach((transaction) => {
    transactionSheet.addRow({
      ...transaction,
      transaction_date: transaction.transaction_date
        ? new Date(transaction.transaction_date).toISOString().split("T")[0]
        : transaction.transaction_date,
      amount: Number(transaction.amount || 0)
    });
  });

  const goalSheet = workbook.addWorksheet("Goals");
  goalSheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Target Amount", key: "target", width: 18, style: { numFmt: "₹#,##0.00" } },
    { header: "Saved Amount", key: "saved", width: 18, style: { numFmt: "₹#,##0.00" } },
    { header: "Status", key: "status", width: 12 },
    { header: "End Date", key: "end_date", width: 18 }
  ];

  goals.forEach((goal) => {
    goalSheet.addRow({
      name: goal.name,
      target: Number(goal.target_amount || 0),
      saved: Number(goal.saved_amount || 0),
      status: goal.status,
      end_date: goal.end_date ? new Date(goal.end_date).toISOString().split("T")[0] : null
    });
  });

  return workbook;
};

const buildUserReportData = async (userId) => {
  const [user, summary, transactions, goals, categories] = await Promise.all([
    findUserById(userId),
    getDashboardSummary(userId),
    getTransactionsByUser(userId),
    getGoalsByUser(userId),
    getCategoryBreakdown(userId)
  ]);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return { user, summary, transactions, goals, categories };
};

const sendWorkbook = async (res, workbook, fileLabel) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `BudgetMate-${fileLabel}-${new Date().toISOString().split("T")[0]}.xlsx`;
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  return res.send(Buffer.from(buffer));
};

export const exportMyReport = async (req, res, next) => {
  try {
    const data = await buildUserReportData(req.user.id);
    const workbook = createWorkbook(data);
    await sendWorkbook(res, workbook, `report-${req.user.id}`);
  } catch (error) {
    next(error);
  }
};

export const exportUserReportByAdmin = async (req, res, next) => {
  try {
    const data = await buildUserReportData(req.params.id);
    const workbook = createWorkbook(data);
    await sendWorkbook(res, workbook, `user-${req.params.id}`);
  } catch (error) {
    next(error);
  }
};
