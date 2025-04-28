const express = require("express");
const router = express.Router();
const driverAuth = require("../../middleware/driver/driverMiddleware");
const {
  driverLogin,
  changePassword,
} = require("../../controllers/driver/driverAuthController");

// Public routes
router.post("/login", driverLogin);

// Protected routes
router.post("/change-password", driverAuth, changePassword);

module.exports = router;
