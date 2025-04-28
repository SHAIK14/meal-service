const express = require("express");
const router = express.Router();
const planController = require("../../controllers/admin/planController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

router.post("/", adminAuth, staffServiceAuth, planController.createPlan);
router.get("/", adminAuth, staffServiceAuth, planController.getPlans);
router.get("/:id", adminAuth, staffServiceAuth, planController.getPlan);
router.put("/:id", adminAuth, staffServiceAuth, planController.updatePlan);
router.delete("/:id", adminAuth, staffServiceAuth, planController.deletePlan);
router.patch(
  "/:id/week-menu",
  adminAuth,
  staffServiceAuth,
  planController.updateWeekMenu
);
router.get(
  "/:id/week-menu",
  adminAuth,
  staffServiceAuth,
  planController.getWeekMenu
); // New route for fetching weekly menu

module.exports = router;
