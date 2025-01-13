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

router.get("/branch/:branchId", adminAuth, getDiningConfig);
router.post("/branch/:branchId", adminAuth, createUpdateDiningConfig);
router.post("/branch/:branchId/tables", adminAuth, addTable);
router.patch("/branch/:branchId/tables/:tableId", adminAuth, toggleTableStatus);
router.delete("/branch/:branchId/tables/:tableId", adminAuth, deleteTable);
// router.get("/config/:branchId", adminAuth, getAllDiningConfigs);

module.exports = router;
