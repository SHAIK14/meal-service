// models/menu/session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    // Existing fields
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerDob: Date,
    pin: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentRequested: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    // New payment tracking fields
    payments: [
      {
        method: {
          type: String,
          enum: ["cash", "card"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        receiptNumber: String, // For card payments
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Excess allocation
    excessAllocation: [
      {
        type: {
          type: String,
          enum: ["tip", "change", "advance", "custom"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        remark: String,
      },
    ],

    // Keep existing payment fields for backward compatibility
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mixed", ""],
      default: "",
    },
    receiptNumber: {
      type: String,
      default: "",
    },
    paymentTimestamp: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
