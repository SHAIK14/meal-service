const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    nameEnglish: { type: String, required: true },
    nameArabic: { type: String, required: true },
    descriptionEnglish: { type: String, required: true },
    descriptionArabic: { type: String, required: true },
    image: { type: String, required: true },
    isVeg: { type: Boolean, default: false },
    isNonVeg: { type: Boolean, default: false },
    isIndividual: { type: Boolean, default: false },
    isMultiple: { type: Boolean, default: false },
    service: {
      type: String,
      enum: ["subscription", "indoorCatering", "outdoorCatering", "dining"],
      required: true,
    },
    package: {
      type: [
        {
          type: String,
          enum: ["breakfast", "lunch", "dinner", "snacks"],
        },
      ],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one package option must be selected",
      },
    },
    packagePricing: {
      type: Map,
      of: Number,
      default: new Map(), // Changed from required to default empty Map
    },
    currency: {
      type: String,
      default: "SAR",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", PlanSchema);
