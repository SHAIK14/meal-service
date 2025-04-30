const express = require("express");
const router = express.Router();
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");
const {
  getBranchTables,
  updateTableStatus,
  getTableSession,
  completeSession,
  generateInvoice,
  processOrderItemAction,
  updateOrderStatus,
  processPayment,
  getPaymentDetails,
} = require("../../controllers/kitchen/diningController");

router.get("/tables", kitchenAuth, getBranchTables);
router.put("/tables/:tableId/status", kitchenAuth, updateTableStatus);
// Session and order management routes
router.get("/tables/:tableName/session", kitchenAuth, getTableSession);
router.post("/sessions/:sessionId/complete", kitchenAuth, completeSession);
router.get("/sessions/:sessionId/invoice", kitchenAuth, generateInvoice);

// New payment routes
router.post(
  "/sessions/:sessionId/process-payment",
  kitchenAuth,
  processPayment
);
router.get(
  "/sessions/:sessionId/payment-details",
  kitchenAuth,
  getPaymentDetails
);

router.put("/orders/:orderId/status", kitchenAuth, updateOrderStatus);
router.post(
  "/orders/:orderId/items/:itemIndex/process",
  kitchenAuth,
  processOrderItemAction
);

module.exports = router;
