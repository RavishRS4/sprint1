import { body, param } from "express-validator";

export const transactionIdParam = [param("id").isInt({ min: 1 })];

export const createTransactionValidator = [
  body("type").isIn(["income", "expense"]),
  body("category").trim().notEmpty().isLength({ max: 100 }),
  body("amount").isFloat({ gt: 0 }),
  body("description").optional({ nullable: true }).isLength({ max: 255 }),
  body("transactionDate").isISO8601().toDate()
];

export const updateTransactionValidator = [
  body("type").optional().isIn(["income", "expense"]),
  body("category").optional().trim().isLength({ max: 100 }),
  body("amount").optional().isFloat({ gt: 0 }),
  body("description").optional({ nullable: true }).isLength({ max: 255 }),
  body("transactionDate").optional().isISO8601().toDate()
];
