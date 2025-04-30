const express = require("express");
const router = express.Router();
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");
const {
  getDiningReportSummary,
  getDiningReportOrders,
  getDiningReportDetails,
} = require("../../controllers/admin/diningReportController");

// Get summary statistics for dashboard
router.get(
  "/summary/:branchId",
  adminAuth,
  staffServiceAuth,
  getDiningReportSummary
);

// Get filtered orders for reports table
router.get(
  "/orders/:branchId",
  adminAuth,
  staffServiceAuth,
  getDiningReportOrders
);

// Get detailed information for a specific order/session
router.get(
  "/details/:orderId",
  adminAuth,
  staffServiceAuth,
  getDiningReportDetails
);

module.exports = router;
