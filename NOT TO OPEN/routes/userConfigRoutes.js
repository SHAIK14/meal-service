const express = require("express");
const router = express.Router();
const { getConfig } = require("../controllers/userConfig");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getConfig);

module.exports = router;
