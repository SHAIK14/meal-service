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
      enum: [
        "NEW_USER",
        "INFO_REQUIRED",
        "INFO_COMPLETE",
        "ADDRESS_COMPLETE",
        "TEST_ACCOUNT",
      ],
      default: "NEW_USER",
    },
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
    address: {
      fullAddress: String,
      saveAs: {
        type: String,
        enum: ["Home", "Office", "Other"],
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
        },
      },
    },
    // New subscription-related fields
    subscriptions: {
      active: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SubscriptionOrder",
        },
      ],
      history: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SubscriptionOrder",
        },
      ],
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    lastSubscriptionDate: Date,
    lastLogin: Date,
  },
  { timestamps: true }
);

// Create a 2dsphere index on the coordinates for efficient geospatial queries
userSchema.index({ "address.coordinates": "2dsphere" });

module.exports = mongoose.model("User", userSchema);
