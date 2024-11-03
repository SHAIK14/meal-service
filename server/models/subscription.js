const mongoose = require("mongoose");

const SubscriptionOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
      },
      name: String,
      duration: Number, // days per week
      selectedDuration: {
        type: String,
        enum: ["1 Week", "2 Weeks", "1 Month"],
        required: true,
      },
      selectedPackages: [
        {
          type: String,
          enum: ["breakfast", "lunch", "dinner", "snacks"],
        },
      ],
      mealPlanType: {
        type: String,
        enum: ["One Meal", "Combo Meal", "Full Day Meal"],
        required: true,
      },
    },
    pricing: {
      originalPrice: {
        type: Number,
        required: true,
      },
      packageDiscounts: {
        type: Number,
        default: 0,
      },
      voucherDiscount: {
        type: Number,
        default: 0,
      },
      finalAmount: {
        type: Number,
        required: true,
      },
    },
    voucher: {
      voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voucher",
      },
      code: String,
      discountType: {
        type: String,
        enum: ["percentage", "flat"],
      },
      discountValue: Number,
    },
    deliveryAddress: {
      fullAddress: {
        type: String,
        required: true,
      },
      saveAs: {
        type: String,
        enum: ["Home", "Office", "Other"],
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number],
      },
    },
    payment: {
      transactionId: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        enum: ["Visa/Mastercard", "STC Pay"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      details: {
        cardHolderName: String,
        lastFourDigits: String,
        stcPhoneNumber: String,
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "paused"],
      default: "active",
    },
    menuSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyMenu",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    cycleRenewalDate: Date,
    lastRenewalDate: Date,
  },
  { timestamps: true }
);

// Generate unique orderId before saving

module.exports = mongoose.model("SubscriptionOrder", SubscriptionOrderSchema);
