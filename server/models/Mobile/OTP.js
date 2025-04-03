const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires after 5 minutes (300 seconds)
  },
});

module.exports = mongoose.model("OTP", otpSchema);
