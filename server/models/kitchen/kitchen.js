const mongoose = require("mongoose");

const KitchenSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    mealSlots: {
      breakfast: {
        totalCount: {
          type: Number,
          default: 0,
        },
        items: [
          {
            name: String,
            quantity: Number,
            isPrepared: {
              type: Boolean,
              default: false,
            },
            planWiseBreakdown: [
              {
                planName: String,
                count: Number,
              },
            ],
          },
        ],
      },
      lunch: {
        totalCount: {
          type: Number,
          default: 0,
        },
        items: [
          {
            name: String,
            quantity: Number,
            isPrepared: {
              type: Boolean,
              default: false,
            },
            planWiseBreakdown: [
              {
                planName: String,
                count: Number,
              },
            ],
          },
        ],
      },
      dinner: {
        totalCount: {
          type: Number,
          default: 0,
        },
        items: [
          {
            name: String,
            quantity: Number,
            isPrepared: {
              type: Boolean,
              default: false,
            },
            planWiseBreakdown: [
              {
                planName: String,
                count: Number,
              },
            ],
          },
        ],
      },
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
KitchenSchema.index({ date: 1 });
KitchenSchema.index({ status: 1 });

module.exports = mongoose.model("Kitchen", KitchenSchema);
