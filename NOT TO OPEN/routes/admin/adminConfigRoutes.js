const express = require("express");
const router = express.Router();
const configController = require("../../controllers/admin/adminConfigController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validateBranch = require("../../middleware/admin/validateBranch");

// Base Configuration Routes
router.get(
  "/:branchId",
  adminAuth,
  validateBranch,
  configController.getConfiguration
);
router.put(
  "/:branchId/basic",
  adminAuth,
  validateBranch,
  configController.updateBasicConfig
);

// Weekly Holidays Route
router.put(
  "/:branchId/weekly-holidays",
  adminAuth,
  validateBranch,
  configController.updateWeeklyHolidays
);

// National Holidays Routes
router.get(
  "/:branchId/holidays",
  adminAuth,
  validateBranch,
  configController.getNationalHolidays
);
router.post(
  "/:branchId/holiday",
  adminAuth,
  validateBranch,
  configController.addNationalHoliday
);
router.put(
  "/:branchId/holiday/:holidayId",
  adminAuth,
  validateBranch,
  configController.updateNationalHoliday
);
router.delete(
  "/:branchId/holiday/:holidayId",
  adminAuth,
  validateBranch,
  configController.deleteNationalHoliday
);

// Emergency Closure Routes
router.get(
  "/:branchId/emergencies",
  adminAuth,
  validateBranch,
  configController.getEmergencyClosures
);
router.post(
  "/:branchId/emergency",
  adminAuth,
  validateBranch,
  configController.addEmergencyClosure
);
router.put(
  "/:branchId/emergency/:closureId",
  adminAuth,
  validateBranch,
  configController.updateEmergencyClosure
);
router.delete(
  "/:branchId/emergency/:closureId",
  adminAuth,
  validateBranch,
  configController.deleteEmergencyClosure
);

// Delivery Time Slots Routes
router.get(
  "/:branchId/delivery-slots",
  adminAuth,
  validateBranch,
  configController.getDeliveryTimeSlots
);
router.put(
  "/:branchId/delivery-slots",
  adminAuth,
  validateBranch,
  configController.updateDeliveryTimeSlots
);

// Plan Duration Routes
router.get(
  "/:branchId/plan-durations",
  adminAuth,
  validateBranch,
  configController.getPlanDurations
);
router.post(
  "/:branchId/plan-duration",
  adminAuth,
  validateBranch,
  configController.addPlanDuration
);
router.put(
  "/:branchId/plan-duration/:planId",
  adminAuth,
  validateBranch,
  configController.updatePlanDuration
);
router.delete(
  "/:branchId/plan-duration/:planId",
  adminAuth,
  validateBranch,
  configController.deletePlanDuration
);

module.exports = router;
