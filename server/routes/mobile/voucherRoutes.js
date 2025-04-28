const express = require("express");
const router = express.Router();
const voucherController = require("../../controllers/mobile/voucherController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// All routes require authentication
router.use(protect);

// Validate a voucher code
router.post("/validate", voucherController.validateVoucher);

// Apply a voucher to an order
router.post("/apply", voucherController.applyVoucher);

module.exports = router;
