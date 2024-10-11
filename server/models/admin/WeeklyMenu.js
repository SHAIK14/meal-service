const mongoose = require("mongoose");

const WeeklyMenuSchema = new mongoose.Schema(
  {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    weekMenu: {
      type: Map,
      of: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyMenu", WeeklyMenuSchema);
