const mongoose = require("mongoose");

const cateringConfigSchema = new mongoose.Schema(
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
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      default: "",
    },
    customUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CateringConfig", cateringConfigSchema);
