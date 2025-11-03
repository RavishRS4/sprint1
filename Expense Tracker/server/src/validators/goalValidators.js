import { body, param } from "express-validator";

export const goalIdParam = [param("id").isInt({ min: 1 })];

export const createGoalValidator = [
  body("name").trim().notEmpty().isLength({ max: 150 }),
  body("targetAmount").isFloat({ gt: 0 }),
  body("description").optional({ nullable: true }).isLength({ max: 255 }),
  body("endDate").optional({ nullable: true }).isISO8601().toDate()
];

export const updateGoalValidator = [
  body("name").optional().trim().isLength({ max: 150 }),
  body("targetAmount").optional().isFloat({ gt: 0 }),
  body("description").optional({ nullable: true }).isLength({ max: 255 }),
  body("endDate").optional({ nullable: true }).isISO8601().toDate(),
  body("status").optional().isIn(["active", "achieved", "expired"])
];

export const goalContributionValidator = [
  body("amount").isFloat({ gt: 0 }),
  body("contributionDate").isISO8601().toDate()
];

export const contributionIdParam = [param("contributionId").isInt({ min: 1 })];

export const updateGoalContributionValidator = [
  body("amount").isFloat({ gt: 0 }),
  body("contributionDate").isISO8601().toDate()
];
