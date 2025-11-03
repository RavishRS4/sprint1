import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  requestPasswordResetValidator,
  resetPasswordValidator
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/forgot-password", requestPasswordResetValidator, requestPasswordReset);
router.post("/reset-password", resetPasswordValidator, resetPassword);
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfileValidator, updateProfile);

export default router;
