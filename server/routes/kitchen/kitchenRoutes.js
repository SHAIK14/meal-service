const express = require("express");
const router = express.Router();
const kitchenController = require("../../controllers/kitchen/kitchenController");
const kitchenAuth = require("../../middleware/kitchen/kitchenAuthMiddleware");

router.get("/meal-counts", kitchenAuth, kitchenController.getMealCountsByDate);
router.get("/orders-for-kot", kitchenAuth, kitchenController.getOrdersForKOT);
router.post("/generate-kot", kitchenAuth, kitchenController.generateKOT);

module.exports = router;
