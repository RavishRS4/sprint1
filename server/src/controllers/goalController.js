import { validationResult } from "express-validator";
import {
  createGoal,
  getGoalsByUser,
  getGoalById,
  updateGoal,
  deleteGoal,
  addGoalContribution,
  getGoalContributions
} from "../models/goalModel.js";

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

    await addGoalContribution({
      goalId: goal.id,
      amount: req.body.amount,
      contributionDate: req.body.contributionDate
    });

    const updatedGoal = await getGoalById(req.params.id, req.user.id);
    const normalized = normalizeGoal(await syncGoalStatus(updatedGoal));
    return res.status(201).json({ goal: normalized });
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
