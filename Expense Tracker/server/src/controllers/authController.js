import { validationResult } from "express-validator";
import crypto from "crypto";
import { createUser, findUserByEmail, findUserById, updateUser } from "../models/userModel.js";
import {
  createPasswordResetToken,
  findValidResetToken,
  invalidateActiveTokensForUser,
  markResetTokenUsed
} from "../models/passwordResetTokenModel.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { getDashboardSummary } from "../models/transactionModel.js";
import { getGoalsByUser } from "../models/goalModel.js";
import { sendPasswordResetEmail } from "../utils/email.js";

const buildAuthResponse = (user) => {
  const token = signToken({ id: user.id, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      salary: Number(user.salary ?? 0),
      role: user.role
    }
  };
};

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password, salary } = req.body;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser({ name, email, passwordHash, salary });
    const response = buildAuthResponse(newUser);
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({ message: "If the email is registered, you'll receive reset instructions shortly." });
    }

    await invalidateActiveTokensForUser(user.id);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await createPasswordResetToken({ userId: user.id, token, expiresAt });

    const resetUrl = `${process.env.APP_URL ?? "http://localhost:5173"}/reset-password/${token}`;
    const emailDelivered = await sendPasswordResetEmail({ to: email, resetUrl });

    return res.json({
      message: emailDelivered
        ? "Reset instructions sent to your email."
        : "Email delivery is currently unavailable. Use the link below to reset your password.",
      delivered: emailDelivered,
      resetLink: emailDelivered ? undefined : resetUrl
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { token, password } = req.body;
    const record = await findValidResetToken(token);
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const passwordHash = await hashPassword(password);
    await updateUser(record.user_id, { passwordHash });
    await markResetTokenUsed(record.id);

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const response = buildAuthResponse(user);
    return res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [dashboard, goals] = await Promise.all([
      getDashboardSummary(user.id),
      getGoalsByUser(user.id)
    ]);

    return res.json({
      user,
      dashboard,
      goals
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const updatedUser = await updateUser(req.user.id, req.body);
    return res.json({
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
