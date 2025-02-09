const express = require("express");
const router = express.Router();
const planController = require("../../controllers/admin/planController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.post("/", adminAuth, planController.createPlan);
router.get("/", adminAuth, planController.getPlans);
router.get("/:id", adminAuth, planController.getPlan);
router.put("/:id", adminAuth, planController.updatePlan);
router.delete("/:id", adminAuth, planController.deletePlan);
router.patch("/:id/week-menu", adminAuth, planController.updateWeekMenu);
router.get("/:id/week-menu", adminAuth, planController.getWeekMenu); // New route for fetching weekly menu

module.exports = router;
