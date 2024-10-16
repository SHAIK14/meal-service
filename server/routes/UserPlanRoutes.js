const express = require("express");
const router = express.Router();
const {
  getAllPlans,
  getPlanById,
  getPlanWeeklyMenu,
  getItemsBatch,
} = require("../controllers/userPlanController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected with basic authentication
router.get("/", protect, getAllPlans);
router.get("/:id", protect, getPlanById);
router.get("/:id/weekly-menu", protect, getPlanWeeklyMenu);
router.post("/items/batch", protect, getItemsBatch);

module.exports = router;
