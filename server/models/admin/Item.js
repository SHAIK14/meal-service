// server/models/admin/Item.js
const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema({
  currency: { type: String, required: true },
  sellingPrice: { type: Number, required: true },
  discountPrice: { type: Number },
});

const ItemSchema = new mongoose.Schema(
  {
    nameEnglish: { type: String, required: true },
    nameArabic: { type: String, required: true },
    descriptionEnglish: { type: String, required: true },
    descriptionArabic: { type: String, required: true },
    image: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    type: { type: String, enum: ["Non Veg", "Veg"], required: true },
    category: {
      type: String,
      enum: ["Lunch", "Dinner", "Lunch and Dinner"],
      required: true,
    },
    prices: [PriceSchema],
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
