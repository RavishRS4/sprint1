import { Router } from "express";
import { exportMyReport } from "../controllers/reportController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authenticate, exportMyReport);

export default router;
