const mongoose = require("mongoose");

const diningSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      unique: true,
    },
    diningRadius: {
      type: Number,
      required: true,
      min: 0,
    },
    baseUrl: {
      type: String,
      required: true,
    },
    tables: [
      {
        name: { type: String, required: true },
        isEnabled: { type: Boolean, default: true },
        status: {
          type: String,
          enum: ["available", "occupied"],
          default: "available",
        },
        qrCode: String,
        customUrl: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure table names are unique within a branch
diningSchema.index({ branchId: 1, "tables.name": 1 }, { unique: true });

module.exports = mongoose.model("Dining", diningSchema);
