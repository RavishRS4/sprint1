import { Router } from "express";
import {
  listGoals,
  createGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
  addContributionHandler,
  listContributions
} from "../controllers/goalController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createGoalValidator,
  updateGoalValidator,
  goalContributionValidator,
  goalIdParam
} from "../validators/goalValidators.js";

const router = Router();

router.use(authenticate);

router.get("/", listGoals);
router.post("/", createGoalValidator, createGoalHandler);
router.put("/:id", goalIdParam, updateGoalValidator, updateGoalHandler);
router.delete("/:id", goalIdParam, deleteGoalHandler);
router.post("/:id/contributions", goalIdParam, goalContributionValidator, addContributionHandler);
router.get("/:id/contributions", goalIdParam, listContributions);

export default router;
