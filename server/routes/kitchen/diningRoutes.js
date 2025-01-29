const express = require("express");
const router = express.Router();
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");
const {
  getBranchTables,
  updateTableStatus,
  getTableSession,
  completeSession,
  generateKOT,
} = require("../../controllers/kitchen/diningController");

router.get("/tables", kitchenAuth, getBranchTables);
router.put("/tables/:tableId/status", kitchenAuth, updateTableStatus);
// Session and order management routes
router.get("/tables/:tableName/session", kitchenAuth, getTableSession);
router.post("/sessions/:sessionId/complete", kitchenAuth, completeSession);
router.get("/sessions/:sessionId/kot", kitchenAuth, generateKOT);
module.exports = router;
