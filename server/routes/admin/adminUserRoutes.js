// routes/admin/adminUserRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserDetailsById,
  getUserAnalytics,
} = require("../../controllers/admin/adminUserController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

// Get user analytics
router.get("/analytics", adminAuth,staffServiceAuth, getUserAnalytics);

// Get all users with filters and pagination
router.get("/", adminAuth,staffServiceAuth, getAllUsers);

// Get specific user details
router.get("/:userId", adminAuth,staffServiceAuth, getUserDetailsById);

module.exports = router;
