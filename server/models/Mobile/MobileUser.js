const mongoose = require("mongoose");

const mobileUserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  countryCode: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  addresses: [
    {
      name: { type: String },
      address: { type: String },
      apartment: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
      isDefault: { type: Boolean, default: false },
    },
  ],
  lastLogin: {
    type: Date,
  },
  deviceToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

mobileUserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("MobileUser", mobileUserSchema);
