const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    otp: String,
    otpExpires: Date,
    status: {
      type: String,
      enum: ["NEW_USER", "INFO_REQUIRED", "INFO_COMPLETE", "TEST_ACCOUNT"],
      default: "NEW_USER",
    },
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
    lastLogin: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
