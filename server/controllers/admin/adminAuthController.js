// server/controllers/admin/adminAuthController.js
const Admin = require("../../models/admin/Admin");
const Staff = require("../../models/admin/Staff");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check Admin first
    const admin = await Admin.findOne({ username });
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        const token = jwt.sign(
          { id: admin._id, type: "admin" },
          process.env.JWT_SECRET_ADMIN,
          { expiresIn: process.env.JWT_EXPIRY }
        );
        return res.json({
          success: true,
          message: "Logged in successfully",
          data: {
            token: token,
            type: "admin",
          },
        });
      }
    }

    // Then check Staff
    const staff = await Staff.findOne({ username })
      .populate("role")
      .populate("branch", "name")
      .populate("services", "name route");

    if (staff) {
      const isMatch = await staff.comparePassword(password);
      if (isMatch) {
        const token = jwt.sign(
          { id: staff._id, type: "staff" },
          process.env.JWT_SECRET_ADMIN,
          { expiresIn: process.env.JWT_EXPIRY }
        );
        return res.json({
          success: true,
          message: "Logged in successfully",
          data: {
            token,
            type: "staff",
            role: staff.role,
            services: staff.services,
            branch: staff.branch,
          },
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
