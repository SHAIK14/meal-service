const express = require("express");
const router = express.Router();
const serviceController = require("../../controllers/admin/serviceController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

router.post("/", adminAuth, staffServiceAuth, serviceController.createService);
router.get("/", adminAuth, staffServiceAuth, serviceController.getServices);
router.put(
  "/:id",
  adminAuth,
  staffServiceAuth,
  serviceController.updateService
);

module.exports = router;
