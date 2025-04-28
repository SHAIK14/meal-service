const Staff = require("../../models/admin/Staff");

// Create new staff
exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, username, password, branch, role, services } =
      req.body;

    // Check if username exists
    const existingStaff = await Staff.findOne({ username });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const staff = new Staff({
      name,
      email,
      phone,
      username,
      password,
      branch,
      role,
      services,
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: await Staff.findById(staff._id)
        .populate("branch", "name")
        .populate("role", "name")
        .select("-password"),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.find()
      .populate("branch", "name")
      .populate("role", "name")
      .select("-password");

    res.json({
      success: true,
      data: staffList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update staff password
exports.updatePassword = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { newPassword } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    staff.password = newPassword;
    await staff.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// In staffController.js
// Update staff details
exports.updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { role, branch } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      { role, branch },
      { new: true }
    )
      .populate("branch", "name")
      .populate("role", "name")
      .select("-password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.json({
      success: true,
      message: "Staff updated successfully",
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update staff services
exports.updateServices = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { services } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      { services },
      { new: true }
    )
      .populate("branch", "name")
      .populate("role", "name")
      .select("-password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.json({
      success: true,
      message: "Services updated successfully",
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
