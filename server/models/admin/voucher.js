const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
  {
    promoCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    eligibleMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxThreshold: {
      type: Number,
      required: function () {
        return this.discountType === "percentage";
      },
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    appliedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    eligiblePlans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
      },
    ],
    usedInOrders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SubscriptionOrder",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        discountApplied: Number,
      },
    ],
  },

  { timestamps: true }
);

// Index for faster lookups
VoucherSchema.index({ promoCode: 1 });
VoucherSchema.index({ startDate: 1, endDate: 1 });
VoucherSchema.index({ isActive: 1 });

module.exports = mongoose.model("Voucher", VoucherSchema);
