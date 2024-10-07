// server/controllers/admin/adminAuthController.js
const Admin = require("../../models/admin/Admin");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_ADMIN, {
      expiresIn: process.env.JWT_EXPIRY,
    });
    res.json({ message: "Logged in successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
