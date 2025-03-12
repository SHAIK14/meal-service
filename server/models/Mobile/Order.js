const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MobileUser",
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
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
  deliveryType: {
    type: String,
    enum: ["pickup", "delivery"],
    required: true,
  },
  deliveryAddress: {
    address: { type: String },
    apartment: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "credit_card", "apple_pay", "mada", "stc_pay"],
    default: "cash",
  },
  paymentDetails: {
    transactionId: { type: String },
    paymentDate: { type: Date, default: Date.now },
    additionalInfo: { type: mongoose.Schema.Types.Mixed },
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the 'updatedAt' field on save
orderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("MobileOrder", orderSchema);
