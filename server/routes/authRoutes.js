const express = require("express");
const router = express.Router();
const { requestOTP, verifyOTP } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
