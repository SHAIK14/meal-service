// models/takeaway/TakeAwayToken.js
const mongoose = require("mongoose");

const TakeAwayTokenSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    lastTokenNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index to ensure only one token counter per branch per day
TakeAwayTokenSchema.index({ branchId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("TakeAwayToken", TakeAwayTokenSchema);
