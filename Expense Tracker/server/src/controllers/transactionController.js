import { validationResult } from "express-validator";
import {
  createTransaction,
  getTransactionsByUser,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary
} from "../models/transactionModel.js";

export const listTransactions = async (req, res, next) => {
  try {
    const { category, type, startDate, endDate } = req.query;
    const filters = { category, type, startDate, endDate };
    const transactions = await getTransactionsByUser(req.user.id, filters);
    const summary = await getDashboardSummary(req.user.id);
    return res.json({ transactions, summary });
  } catch (error) {
    next(error);
  }
};

export const createTransactionHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const payload = {
      userId: req.user.id,
      type: req.body.type,
      category: req.body.category,
      amount: req.body.amount,
      description: req.body.description,
      transactionDate: req.body.transactionDate
    };

    const transaction = await createTransaction(payload);
    const summary = await getDashboardSummary(req.user.id);
    return res.status(201).json({ transaction, summary });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const transaction = await getTransactionById(req.params.id, req.user.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const updates = {
      type: req.body.type,
      category: req.body.category,
      amount: req.body.amount,
      description: req.body.description,
      transactionDate: req.body.transactionDate
    };

    const updatedTransaction = await updateTransaction(req.params.id, req.user.id, updates);
    const summary = await getDashboardSummary(req.user.id);
    return res.json({ transaction: updatedTransaction, summary });
  } catch (error) {
    next(error);
  }
};

export const deleteTransactionHandler = async (req, res, next) => {
  try {
    const transaction = await getTransactionById(req.params.id, req.user.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await deleteTransaction(req.params.id, req.user.id);
    const summary = await getDashboardSummary(req.user.id);
    return res.json({ message: "Transaction deleted", summary });
  } catch (error) {
    next(error);
  }
};
