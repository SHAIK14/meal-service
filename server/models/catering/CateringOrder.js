const mongoose = require("mongoose");

const cateringOrderSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
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
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    // New fields for payment tracking
    advanceAmount: {
      type: Number,
      default: 0, // Optional field, defaults to 0
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumDetails: {
      type: String,
      default: "",
    },
    cateringType: {
      type: String,
      enum: ["indoor", "outdoor"],
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    referralSource: {
      type: String,
      enum: ["staff", "self"],
      required: true,
    },
    staffName: {
      type: String,
      // Not required as it's only applicable if referralSource is 'staff'
    },
    customerName: {
      type: String,
      required: true,
    },
    customerContact: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    notes: String,
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CateringOrder", cateringOrderSchema);
