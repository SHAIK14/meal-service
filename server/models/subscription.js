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
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    plan: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
      },
      name: String,

      durationType: {
        type: String,
        enum: ["1_week", "2_week", "1_month"],
        required: true,
      },
      selectedPackages: [
        {
          type: String,
          enum: ["breakfast", "lunch", "dinner", "snacks"],
        },
      ],
      totalDays: {
        type: Number,
        required: true,
      },
      extraDaysAdded: {
        type: Number,
        default: 0,
      },
      subscriptionDays: [
        {
          date: {
            type: Date,
            required: true,
          },
          isAvailable: {
            type: Boolean,
            required: true,
          },
          unavailableReason: String,
          isSkipped: {
            type: Boolean,
            default: false,
          },
          skippedAt: {
            type: Date,
          },
          isExtensionDay: {
            type: Boolean,
            default: false,
          },
          originalSkippedDate: {
            type: Date,
          },
        },
      ],
      deliveryTime: {
        fromTime: String,
        toTime: String,
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
      skipMealStatus: {
        totalSkipsAllowed: {
          type: Number,
          required: true,
        },
        skipsUsed: {
          type: Number,
          default: 0,
        },
        lastSkipDate: Date,
      },
    },
    pricing: {
      dailyRate: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
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
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voucher",
      },
      promoCode: String,
      discountType: {
        type: String,
        enum: ["percentage", "flat"],
      },
      discountValue: Number,
    },
    deliveryAddress: {
      type: {
        type: String,
        enum: ["Home", "Office", "Other"],
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: true,
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
        cardNumber: String,
        stcPhoneNumber: String,
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "paused"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    skipHistory: [
      {
        originalDate: {
          type: Date,
          required: true,
        },
        extensionDate: {
          type: Date,
          required: true,
        },
        skippedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
        isSystemGenerated: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// Add index for better query performance
SubscriptionOrderSchema.index({ orderId: 1, user: 1 });
SubscriptionOrderSchema.index({ "plan.subscriptionDays.date": 1 });
SubscriptionOrderSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("SubscriptionOrder", SubscriptionOrderSchema);
