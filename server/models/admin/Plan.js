const mongoose = require("mongoose");

const PackagePricingSchema = new mongoose.Schema({
  totalPrice: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number, default: 0 },
  isCouponEligible: { type: Boolean, default: false },
});

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
      of: PackagePricingSchema,
      default: new Map(),
    },
    totalPrice: { type: Number, default: 0 },
    duration: { type: Number, required: true, min: 1, max: 7 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", PlanSchema);
