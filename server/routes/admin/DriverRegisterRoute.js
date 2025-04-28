const express = require("express");
const router = express.Router();
const adminDriverController = require("../../controllers/admin/DriverRegisterController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

// Register new driver
router.post(
  "/register",
  adminAuth,
  staffServiceAuth,
  adminDriverController.registerDriver
);

// Get all drivers with filters
router.get(
  "/",
  adminAuth,
  staffServiceAuth,
  adminDriverController.getAllDrivers
);

// Get specific driver details
router.get(
  "/:id",
  adminAuth,
  staffServiceAuth,
  adminDriverController.getDriverById
);

// Approve driver and generate credentials
router.patch(
  "/:id/approve",
  adminAuth,
  staffServiceAuth,
  adminDriverController.approveDriver
);

// Update driver details
router.patch(
  "/:id",
  adminAuth,
  staffServiceAuth,
  adminDriverController.updateDriver
);

// Delete driver
router.delete(
  "/:id",
  adminAuth,
  staffServiceAuth,
  adminDriverController.deleteDriver
);

module.exports = router;
