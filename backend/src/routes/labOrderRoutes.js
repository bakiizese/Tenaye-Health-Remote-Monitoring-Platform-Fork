import { Router } from "express";
import LabOrder from "../models/LabOrder.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/lab-orders — returns the current patient's lab orders
router.get("/", protect, async (req, res) => {
  try {
    const orders = await LabOrder.find({ patient: req.user._id })
      .sort({ ordered_at: -1 })
      .populate("doctor", "specialty")
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lab orders" });
  }
});

export default router;
