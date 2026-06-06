import { Router } from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/conversations", protect, getConversations);
router.get("/:partnerId", protect, getMessages);
router.post("/:receiverId", protect, sendMessage);

export default router;
