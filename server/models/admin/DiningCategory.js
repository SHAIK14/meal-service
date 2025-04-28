const mongoose = require("mongoose");

const DiningCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add an index on name for faster queries
DiningCategorySchema.index({ name: 1 });

module.exports = mongoose.model("DiningCategory", DiningCategorySchema);
