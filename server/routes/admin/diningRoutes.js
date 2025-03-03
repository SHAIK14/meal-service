const express = require("express");
const router = express.Router();
const adminAuth = require("../../middleware/admin/adminAuth");
const {
  getDiningConfig,
  createUpdateDiningConfig,
  addTable,
  toggleTableStatus,
  deleteTable,
  //   getAllDiningConfigs,
} = require("../../controllers/admin/diningController");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

router.get("/branch/:branchId", adminAuth, staffServiceAuth, getDiningConfig);
router.post(
  "/branch/:branchId",
  adminAuth,
  staffServiceAuth,
  createUpdateDiningConfig
);
router.post("/branch/:branchId/tables", adminAuth, staffServiceAuth, addTable);
router.patch(
  "/branch/:branchId/tables/:tableId",
  adminAuth,
  staffServiceAuth,
  toggleTableStatus
);
router.delete(
  "/branch/:branchId/tables/:tableId",
  adminAuth,
  staffServiceAuth,
  deleteTable
);
// router.get("/config/:branchId", adminAuth, getAllDiningConfigs);

module.exports = router;
