const mongoose = require("mongoose");

const diningOrderSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        spiceLevel: {
          type: Number,
          default: 0,
          min: 0,
          max: 3,
        },
        dietaryNotes: {
          type: String,
          default: "",
        },
        returnedQuantity: {
          type: Number,
          default: 0,
        },
        returnReason: String,
        returnedAt: Date,
        cancelledQuantity: {
          type: Number,
          default: 0,
        },
        cancelReason: String,
        cancelledAt: Date,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "admin_approved",
        "in_preparation",
        "ready_for_pickup",
        "served",
        "canceled",
      ],
      default: "pending",
    },
    statusTimestamps: {
      pending: { type: Date, default: Date.now },
      admin_approved: Date,
      in_preparation: Date,
      ready_for_pickup: Date,
      served: Date,
      canceled: Date,
    },
    notes: String,
    orderNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values to not trigger uniqueness constraint
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiningOrder", diningOrderSchema);
