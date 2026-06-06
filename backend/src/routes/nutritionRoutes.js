import { Router } from "express";
import { getNutritionRecommendations } from "../controllers/nutritionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/recommendations", protect, getNutritionRecommendations);

export default router;
