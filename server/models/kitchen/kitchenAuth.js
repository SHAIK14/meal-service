const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const KitchenUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

KitchenUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const KitchenUser = mongoose.model("KitchenUser", KitchenUserSchema);

module.exports = KitchenUser;