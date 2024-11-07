const express = require("express");
const router = express.Router();
const configController = require("../../controllers/admin/adminConfigController");
const adminAuth = require("../../middleware/admin/adminAuth");

// Base Configuration Routes
router.get("/", adminAuth, configController.getConfiguration);
router.put("/basic", adminAuth, configController.updateBasicConfig);

// Location Settings Route
router.put("/location", adminAuth, configController.updateLocationSettings);

// Weekly Holidays Route
router.put(
  "/weekly-holidays",
  adminAuth,
  configController.updateWeeklyHolidays
);

// National Holidays Routes
router.get("/holidays", adminAuth, configController.getNationalHolidays);
router.post("/holiday", adminAuth, configController.addNationalHoliday);
router.put(
  "/holiday/:holidayId",
  adminAuth,
  configController.updateNationalHoliday
);
router.delete(
  "/holiday/:holidayId",
  adminAuth,
  configController.deleteNationalHoliday
);

// Emergency Closure Routes
router.get("/emergencies", adminAuth, configController.getEmergencyClosures);
router.post("/emergency", adminAuth, configController.addEmergencyClosure);
router.put(
  "/emergency/:closureId",
  adminAuth,
  configController.updateEmergencyClosure
);
router.delete(
  "/emergency/:closureId",
  adminAuth,
  configController.deleteEmergencyClosure
);

module.exports = router;
