import { Router } from "express";
import { getChatStatus, sendChatMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/status", protect, getChatStatus);
router.post("/message", protect, sendChatMessage);

export default router;
