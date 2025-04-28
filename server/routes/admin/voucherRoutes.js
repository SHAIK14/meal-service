const express = require("express");
const router = express.Router();
const voucherController = require("../../controllers/admin/voucherController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

// Admin routes
router.post("/", adminAuth, staffServiceAuth, voucherController.createVoucher);
router.get("/", adminAuth, staffServiceAuth, voucherController.getVouchers);
router.patch(
  "/:id/toggle",
  adminAuth,
  staffServiceAuth,
  voucherController.toggleVoucher
);
router.delete(
  "/:id",
  adminAuth,
  staffServiceAuth,
  voucherController.deleteVoucher
);

module.exports = router;
