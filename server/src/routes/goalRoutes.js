import { Router } from "express";
import {
  listGoals,
  createGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
  addContributionHandler,
  updateContributionHandler,
  deleteContributionHandler,
  listContributions
} from "../controllers/goalController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createGoalValidator,
  updateGoalValidator,
  goalContributionValidator,
  goalIdParam,
  contributionIdParam,
  updateGoalContributionValidator
} from "../validators/goalValidators.js";

const router = Router();

router.use(authenticate);

router.get("/", listGoals);
router.post("/", createGoalValidator, createGoalHandler);
router.put("/:id", goalIdParam, updateGoalValidator, updateGoalHandler);
router.delete("/:id", goalIdParam, deleteGoalHandler);
router.post("/:id/contributions", goalIdParam, goalContributionValidator, addContributionHandler);
router.put(
  "/:id/contributions/:contributionId",
  goalIdParam,
  contributionIdParam,
  updateGoalContributionValidator,
  updateContributionHandler
);
router.delete(
  "/:id/contributions/:contributionId",
  goalIdParam,
  contributionIdParam,
  deleteContributionHandler
);
router.get("/:id/contributions", goalIdParam, listContributions);

export default router;
