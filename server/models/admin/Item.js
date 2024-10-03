// server/models/admin/Item.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: {
      english: { type: String, required: true },
      arabic: { type: String, required: true },
    },
    description: {
      english: { type: String, required: true },
      arabic: { type: String, required: true },
    },
    image: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    isVegetarian: { type: Boolean, required: true },
    mealType: { type: String, enum: ["lunch", "dinner"], required: true },
    prices: {
      SAR: { type: Number, required: true },
      AED: { type: Number, required: true },
      BHD: { type: Number, required: true },
      QAR: { type: Number, required: true },
    },
    discountPrices: {
      SAR: { type: Number },
      AED: { type: Number },
      BHD: { type: Number },
      QAR: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
