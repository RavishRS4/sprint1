import { Router } from "express";
import {
  listTransactions,
  createTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler
} from "../controllers/transactionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createTransactionValidator,
  updateTransactionValidator,
  transactionIdParam
} from "../validators/transactionValidators.js";

const router = Router();

router.use(authenticate);

router.get("/", listTransactions);
router.post("/", createTransactionValidator, createTransactionHandler);
router.put("/:id", transactionIdParam, updateTransactionValidator, updateTransactionHandler);
router.delete("/:id", transactionIdParam, deleteTransactionHandler);

export default router;
