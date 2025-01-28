const express = require("express");
const router = express.Router();
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");
const {
  getBranchTables,
  updateTableStatus,
} = require("../../controllers/kitchen/diningController");

router.get("/tables", kitchenAuth, getBranchTables);
router.put("/tables/:tableId/status", kitchenAuth, updateTableStatus);

module.exports = router;
