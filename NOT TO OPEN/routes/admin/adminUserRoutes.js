// routes/admin/adminUserRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserDetailsById,
  getUserAnalytics,
} = require("../../controllers/admin/adminUserController");
const adminAuth = require("../../middleware/admin/adminAuth");

// Get user analytics
router.get("/analytics", adminAuth, getUserAnalytics);

// Get all users with filters and pagination
router.get("/", adminAuth, getAllUsers);

// Get specific user details
router.get("/:userId", adminAuth, getUserDetailsById);

module.exports = router;
