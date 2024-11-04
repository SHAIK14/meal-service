const express = require("express");
const router = express.Router();
const voucherController = require("../../controllers/admin/voucherController");
const adminAuth = require("../../middleware/admin/adminAuth");

// Admin routes
router.post("/", adminAuth, voucherController.createVoucher);
router.get("/", adminAuth, voucherController.getVouchers);
router.patch("/:id/toggle", adminAuth, voucherController.toggleVoucher);
router.delete("/:id", adminAuth, voucherController.deleteVoucher);

module.exports = router;
