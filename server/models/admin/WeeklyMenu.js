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
