import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty().isLength({ max: 100 }),
  body("email").trim().normalizeEmail().isEmail(),
  body("password").isLength({ min: 6 }),
  body("salary").optional().isFloat({ min: 0 })
];

export const loginValidator = [
  body("email").trim().normalizeEmail().isEmail(),
  body("password").notEmpty()
];

export const requestPasswordResetValidator = [
  body("email").trim().normalizeEmail().isEmail()
];

export const resetPasswordValidator = [
  body("token").isLength({ min: 10 }),
  body("password").isLength({ min: 6 })
];

export const updateProfileValidator = [
  body("name").optional().trim().isLength({ max: 100 }),
  body("email").optional().trim().normalizeEmail().isEmail(),
  body("salary").optional().isFloat({ min: 0 })
];
