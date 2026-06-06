import { Router } from "express";
import { getOrCreateRoom } from "../controllers/groupChatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/room/:moodGroup", protect, getOrCreateRoom);

export default router;
