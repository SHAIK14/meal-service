const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
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
    deliveryTimeSlots: [
      {
        fromTime: String, // Format: "HH:mm AM/PM"
        toTime: String, // Format: "HH:mm AM/PM"
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

    // Location Settings
    country: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", configSchema);
