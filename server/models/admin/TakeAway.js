const mongoose = require("mongoose");

const TakeAwayConfigSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      unique: true,
    },
    baseUrl: {
      type: String,
      required: true,
    },
    customUrl: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TakeAway", TakeAwayConfigSchema);
