const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    currency: {
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
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
  },
  serviceRadius: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
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
// Add password hashing middleware
branchSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = new Date();
  next();
});

// Add method to check password
branchSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
branchSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Branch", branchSchema);
