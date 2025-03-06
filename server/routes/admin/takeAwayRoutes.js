const express = require("express");
const router = express.Router();
const {
  getTakeAwayConfig,
  createUpdateTakeAwayConfig,
  toggleTakeAwayStatus,
  updateTakeAwayUrl,
  deleteTakeAwayConfig,
} = require("../../controllers/admin/takeAwayConfigController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

// Protect all routes with auth middleware

// Get takeaway config for branch
router.get("/:branchId", adminAuth, staffServiceAuth, getTakeAwayConfig);

// Create or update takeaway config
router.post(
  "/:branchId",
  adminAuth,
  staffServiceAuth,
  createUpdateTakeAwayConfig
);

// Toggle takeaway status
router.patch(
  "/:branchId/status",
  adminAuth,
  staffServiceAuth,
  toggleTakeAwayStatus
);

// Update takeaway URL
router.patch("/:branchId/url", adminAuth, staffServiceAuth, updateTakeAwayUrl);

// Delete takeaway config
router.delete("/:branchId", adminAuth, staffServiceAuth, deleteTakeAwayConfig);

module.exports = router;
