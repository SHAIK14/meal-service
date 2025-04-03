const express = require("express");
const router = express.Router();
const staffController = require("../../controllers/admin/staffController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

router.post("/", adminAuth, staffServiceAuth, staffController.createStaff);
router.get("/", adminAuth, staffServiceAuth, staffController.getAllStaff);
router.patch(
  "/:staffId/password",
  adminAuth,
  staffServiceAuth,
  staffController.updatePassword
);
// In staff routes
router.put(
  "/:staffId",
  adminAuth,
  staffServiceAuth,
  staffController.updateStaff
);
router.put(
  "/:staffId/services",
  adminAuth,
  staffServiceAuth,
  staffController.updateServices
);

module.exports = router;
