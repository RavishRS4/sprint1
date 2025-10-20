import { validationResult } from "express-validator";
import {
  createGoal,
  getGoalsByUser,
  getGoalById,
  updateGoal,
  deleteGoal,
  getGoalContributions
} from "../models/goalModel.js";
import pool from "../config/db.js";

const determineGoalStatus = (goal) => {
  if (!goal) return "active";
  const targetAmount = Number(goal.target_amount ?? goal.targetAmount ?? 0);
  const savedAmount = Number(goal.saved_amount ?? goal.savedAmount ?? 0);
  const today = new Date();
  const endDate = goal.end_date ? new Date(goal.end_date) : null;

  if (savedAmount >= targetAmount && targetAmount > 0) {
    return "achieved";
  }

  if (endDate && endDate < today) {
    return "expired";
  }

  return "active";
};

const normalizeGoal = (goal) => {
  if (!goal) return goal;
  return {
    ...goal,
    target_amount: Number(goal.target_amount ?? 0),
    saved_amount: Number(goal.saved_amount ?? 0)
  };
};

const syncGoalStatus = async (goal) => {
  const computedStatus = determineGoalStatus(goal);
  if (goal.status !== computedStatus) {
    await updateGoal(goal.id, goal.user_id, { status: computedStatus });
    return { ...goal, status: computedStatus };
  }
  return goal;
};

export const listGoals = async (req, res, next) => {
  try {
    const goals = await getGoalsByUser(req.user.id);
    const enrichedGoals = await Promise.all(
      goals.map(async (goal) => normalizeGoal(await syncGoalStatus(goal)))
    );
    return res.json({ goals: enrichedGoals });
  } catch (error) {
    next(error);
  }
};

export const createGoalHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const goal = await createGoal({
      userId: req.user.id,
      name: req.body.name,
      targetAmount: req.body.targetAmount,
      description: req.body.description,
      endDate: req.body.endDate
    });
    const normalized = normalizeGoal(await syncGoalStatus(goal));
    return res.status(201).json({ goal: normalized });
  } catch (error) {
    next(error);
  }
};

export const updateGoalHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const existing = await getGoalById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const updates = {
      name: req.body.name,
      targetAmount: req.body.targetAmount,
      description: req.body.description,
      endDate: req.body.endDate,
      status: req.body.status
    };

    const goal = await updateGoal(req.params.id, req.user.id, updates);
    const normalized = normalizeGoal(await syncGoalStatus(goal));
    return res.json({ goal: normalized });
  } catch (error) {
    next(error);
  }
};

export const deleteGoalHandler = async (req, res, next) => {
  try {
    const existing = await getGoalById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await deleteGoal(req.params.id, req.user.id);
    return res.json({ message: "Goal deleted" });
  } catch (error) {
    next(error);
  }
};

export const addContributionHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const goal = await getGoalById(req.params.id, req.user.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute(
        `INSERT INTO goal_contributions (goal_id, amount, contribution_date) VALUES (?, ?, ?)`,
        [goal.id, req.body.amount, req.body.contributionDate]
      );
      await conn.execute(
        `INSERT INTO transactions (user_id, type, category, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          "expense",
          "Goal Contribution",
          req.body.amount,
          `Contribution to goal: ${goal.name}`,
          req.body.contributionDate
        ]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const updatedGoal = await getGoalById(req.params.id, req.user.id);
    const normalized = normalizeGoal(await syncGoalStatus(updatedGoal));
    return res.status(201).json({ goal: normalized });
  } catch (error) {
    next(error);
  }
};

export const updateContributionHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const goal = await getGoalById(req.params.id, req.user.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT gc.id, gc.goal_id, gc.amount AS old_amount, g.name AS goal_name
         FROM goal_contributions gc
         INNER JOIN goals g ON g.id = gc.goal_id
         WHERE gc.id = ? AND g.user_id = ? AND g.id = ?
         LIMIT 1`,
        [req.params.contributionId, req.user.id, req.params.id]
      );
      const existing = rows[0];
      if (!existing) {
        conn.release();
        return res.status(404).json({ message: "Contribution not found" });
      }

      const newAmount = Number(req.body.amount);
      const oldAmount = Number(existing.old_amount);
      const delta = newAmount - oldAmount;

      await conn.beginTransaction();
      await conn.execute(
        `UPDATE goal_contributions SET amount = ?, contribution_date = ? WHERE id = ?`,
        [newAmount, req.body.contributionDate, existing.id]
      );

      if (delta !== 0) {
        if (delta > 0) {
          await conn.execute(
            `INSERT INTO transactions (user_id, type, category, amount, description, transaction_date)
             VALUES (?, 'expense', 'Goal Contribution (edit)', ?, ?, ?)`,
            [req.user.id, delta, `Increase contribution to goal: ${existing.goal_name}`, req.body.contributionDate]
          );
        } else {
          const refund = Math.abs(delta);
          await conn.execute(
            `INSERT INTO transactions (user_id, type, category, amount, description, transaction_date)
             VALUES (?, 'income', 'Salary', ?, ?, ?)`,
            [req.user.id, refund, `Decrease contribution to goal: ${existing.goal_name}`, req.body.contributionDate]
          );
        }
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const updatedGoal = await getGoalById(req.params.id, req.user.id);
    const normalized = normalizeGoal(await syncGoalStatus(updatedGoal));
    return res.json({ goal: normalized });
  } catch (error) {
    next(error);
  }
};

export const deleteContributionHandler = async (req, res, next) => {
  try {
    const goal = await getGoalById(req.params.id, req.user.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT gc.id, gc.goal_id, gc.amount, gc.contribution_date, g.name AS goal_name
         FROM goal_contributions gc
         INNER JOIN goals g ON g.id = gc.goal_id
         WHERE gc.id = ? AND g.user_id = ? AND g.id = ?
         LIMIT 1`,
        [req.params.contributionId, req.user.id, req.params.id]
      );
      const existing = rows[0];
      if (!existing) {
        conn.release();
        return res.status(404).json({ message: "Contribution not found" });
      }

      await conn.beginTransaction();
      await conn.execute(`DELETE FROM goal_contributions WHERE id = ?`, [existing.id]);
      const today = new Date().toISOString().slice(0, 10);
      await conn.execute(
        `INSERT INTO transactions (user_id, type, category, amount, description, transaction_date)
         VALUES (?, 'income', 'Salary', ?, ?, ?)`,
        [req.user.id, existing.amount, `Delete contribution to goal: ${existing.goal_name}`, today]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const updatedGoal = await getGoalById(req.params.id, req.user.id);
    const normalized = normalizeGoal(await syncGoalStatus(updatedGoal));
    return res.json({ goal: normalized, message: "Contribution deleted" });
  } catch (error) {
    next(error);
  }
};

export const listContributions = async (req, res, next) => {
  try {
    const goal = await getGoalById(req.params.id, req.user.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const contributions = await getGoalContributions(req.params.id, req.user.id);
    return res.json({ contributions });
  } catch (error) {
    next(error);
  }
};
