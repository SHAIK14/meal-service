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
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentRequested: {
      type: Boolean,
      default: false,
    },
    // New fields for customer information
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: false, // Optional
    },
    customerDob: {
      type: Date,
      required: false, // Optional
    },
  },
  { timestamps: true }
);

// Ensure only one active session per table
sessionSchema.index(
  { branchId: 1, tableName: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

module.exports = mongoose.model("Session", sessionSchema);
