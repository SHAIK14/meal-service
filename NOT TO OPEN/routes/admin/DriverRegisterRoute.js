const express = require("express");
const router = express.Router();
const adminDriverController = require("../../controllers/admin/DriverRegisterController");
const adminAuth = require("../../middleware/admin/adminAuth");

// Register new driver
router.post("/register", adminAuth, adminDriverController.registerDriver);

// Get all drivers with filters
router.get("/", adminAuth, adminDriverController.getAllDrivers);

// Get specific driver details
router.get("/:id", adminAuth, adminDriverController.getDriverById);

// Approve driver and generate credentials
router.patch("/:id/approve", adminAuth, adminDriverController.approveDriver);

// Update driver details
router.patch("/:id", adminAuth, adminDriverController.updateDriver);

// Delete driver
router.delete("/:id", adminAuth, adminDriverController.deleteDriver);

module.exports = router;
