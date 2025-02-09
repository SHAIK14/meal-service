const express = require("express");
const router = express.Router();
const {
  getAvailableVouchers,
  validateVoucher,
} = require("../controllers/userVoucherController");
const { protect } = require("../middleware/authMiddleware");

// Get available vouchers
router.get("/available", protect, getAvailableVouchers);

// Validate voucher
router.post("/validate", protect, validateVoucher);

module.exports = router;
