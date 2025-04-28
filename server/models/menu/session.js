// models/menu/session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
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
      required: true, // Changed from optional to required
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
