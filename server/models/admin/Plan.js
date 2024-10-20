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
    category: { type: String, required: true },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", PlanSchema);
