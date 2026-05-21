import { Router } from "express";
import {
  register,
  registerDoctor,
  login,
  getMe,
  updateMe,
  updatePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();
router.post("/register", authLimiter, register);
router.post("/register/doctor", authLimiter, registerDoctor);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, updatePassword);
export default router;
