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

    // Skip Allowances - Combined into one object
    skipAllowances: {
      week: {
        type: Number,
        default: 0,
        min: 0,
        max: 7,
      },
      twoWeek: {
        type: Number,
        default: 0,
        min: 0,
        max: 14,
      },
      month: {
        type: Number,
        default: 0,
        min: 0,
        max: 31,
      },
    },

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
