// models/takeaway/TakeAwayOrder.js
const mongoose = require("mongoose");

const TakeAwayOrderSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    tokenNumber: {
      type: String,
      required: true, // Simple sequence (e.g., "042")
    },
    fullToken: {
      type: String,
      required: true, // Full token (e.g., "12345-0305-042")
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "kot-generated"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    kotGenerated: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TakeAwayOrder", TakeAwayOrderSchema);
