const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const KitchenUser = require("../../models/kitchen/kitchenAuth");

// Login controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const kitchen = await KitchenUser.findOne({ username });

    if (!kitchen || !kitchen.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, kitchen.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: kitchen._id },
      process.env.JWT_SECRET_KITCHEN,
      { expiresIn: "12h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create kitchen user controller
exports.createKitchenUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const kitchen = new KitchenUser({ username, password });
    await kitchen.save();
    res.status(201).json({ message: "Kitchen user created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
