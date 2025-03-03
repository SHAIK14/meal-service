const express = require("express");
const router = express.Router();
const configController = require("../../controllers/admin/adminConfigController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validateBranch = require("../../middleware/admin/validateBranch");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

// Base Configuration Routes
router.get(
  "/:branchId",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.getConfiguration
);
router.put(
  "/:branchId/basic",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.updateBasicConfig
);

// Weekly Holidays Route
router.put(
  "/:branchId/weekly-holidays",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.updateWeeklyHolidays
);

// National Holidays Routes
router.get(
  "/:branchId/holidays",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.getNationalHolidays
);
router.post(
  "/:branchId/holiday",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.addNationalHoliday
);
router.put(
  "/:branchId/holiday/:holidayId",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.updateNationalHoliday
);
router.delete(
  "/:branchId/holiday/:holidayId",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.deleteNationalHoliday
);

// Emergency Closure Routes
router.get(
  "/:branchId/emergencies",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.getEmergencyClosures
);
router.post(
  "/:branchId/emergency",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.addEmergencyClosure
);
router.put(
  "/:branchId/emergency/:closureId",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.updateEmergencyClosure
);
router.delete(
  "/:branchId/emergency/:closureId",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.deleteEmergencyClosure
);

// Delivery Time Slots Routes
router.get(
  "/:branchId/delivery-slots",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.getDeliveryTimeSlots
);
router.put(
  "/:branchId/delivery-slots",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.updateDeliveryTimeSlots
);

// Plan Duration Routes
router.get(
  "/:branchId/plan-durations",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.getPlanDurations
);
router.post(
  "/:branchId/plan-duration",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.addPlanDuration
);
router.put(
  "/:branchId/plan-duration/:planId",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.updatePlanDuration
);
router.delete(
  "/:branchId/plan-duration/:planId",
  adminAuth,
  staffServiceAuth,
  validateBranch,
  configController.deletePlanDuration
);

module.exports = router;
