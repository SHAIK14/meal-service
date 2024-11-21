// routes/kitchen/kitchenRoutes.js
const express = require("express");
const router = express.Router();
const kitchenController = require("../../controllers/kitchen/kitchenController");
const kitchenAuth = require("../../middleware/kitchen/kitchenAuthMiddleware");

router.get("/meal-counts", kitchenAuth, kitchenController.getMealCountsByDate);

module.exports = router;
