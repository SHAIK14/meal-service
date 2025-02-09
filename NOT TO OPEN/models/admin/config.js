const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    // Skip Meal Settings
    skipMealDays: {
      type: Number,
      default: 0,
      min: 0,
      max: 7,
    },

    // Plan Start Delay
    planStartDelay: {
      type: Number,
      default: 0,
      min: 0,
      max: 7,
    },
    // Delivery Time Slots
    // In config schema
    deliveryTimeSlots: [
      {
        fromTime: String, // Delivery start "9:00 AM"
        toTime: String, // Delivery end "11:00 AM"
        kitchenTime: String, // Kitchen prep "7:00 AM"
        isActive: Boolean,
      },
    ],

    // Plan Durations
    planDurations: [
      {
        durationType: {
          type: String,
          enum: ["1_week", "2_week", "3_week", "1_month", "2_month", "3_month"],
          required: true,
        },
        minDays: {
          type: Number,
          required: true,
        },
        skipDays: {
          type: Number,
          required: true,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    // Weekly Holidays - Changed to array of strings
    weeklyHolidays: {
      type: [String],
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      default: [],
    },

    // National Holidays
    nationalHolidays: [
      {
        date: { type: Date, required: true },
        name: { type: String, required: true },
      },
    ],

    // Emergency Closures
    emergencyClosures: [
      {
        date: { type: Date, required: true },
        description: { type: String, required: true },
        compensationDays: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);
configSchema.index({ branch: 1 }, { unique: true });

module.exports = mongoose.model("Config", configSchema);
