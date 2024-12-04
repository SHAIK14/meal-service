const mongoose = require("mongoose");

const dynamicAttributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  crNumber: {
    type: String,
    required: true,
  },
  municipalityNumber: {
    type: String,
    required: true,
  },
  vatNumber: {
    type: String,
    required: true,
  },
  address: {
    country: {
      type: String,
      required: true,
    },
    mainAddress: {
      type: String,
      required: true,
    },
    apartment: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
  },
  serviceRadius: {
    type: Number,
    required: true,
  },
  dynamicAttributes: [dynamicAttributeSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

branchSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Branch", branchSchema);
