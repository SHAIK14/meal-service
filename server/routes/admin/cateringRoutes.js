const express = require("express");
const router = express.Router();
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");
const {
  getCateringConfig,
  createUpdateCateringConfig,
  toggleCateringStatus,
  updateCateringUrl,
  deleteCateringConfig,
} = require("../../controllers/admin/cateringController");

// Get catering config for a branch
router.get("/branch/:branchId", adminAuth, staffServiceAuth, getCateringConfig);

// Create or update catering config
router.post(
  "/branch/:branchId",
  adminAuth,
  staffServiceAuth,
  createUpdateCateringConfig
);

// Toggle catering status
router.patch(
  "/branch/:branchId/status",
  adminAuth,
  staffServiceAuth,
  toggleCateringStatus
);

// Update catering URL
router.patch(
  "/branch/:branchId/url",
  adminAuth,
  staffServiceAuth,
  updateCateringUrl
);

// Delete catering config
router.delete(
  "/branch/:branchId",
  adminAuth,
  staffServiceAuth,
  deleteCateringConfig
);

module.exports = router;
