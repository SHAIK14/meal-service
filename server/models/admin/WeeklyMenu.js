const mongoose = require("mongoose");

const WeeklyMenuSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  subscriptionOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionOrder",
  },
  weekMenu: {
    type: Map,
    of: {
      type: Map,
      of: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
      ],
    },
    validate: {
      validator: function (map) {
        const validDays = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        return Array.from(map.keys()).every((day) =>
          validDays.includes(day.toLowerCase())
        );
      },
      message: "Week menu must contain valid days of the week",
    },
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
  weekNumber: Number,
  cycleNumber: Number,
});

module.exports = mongoose.model("WeeklyMenu", WeeklyMenuSchema);
