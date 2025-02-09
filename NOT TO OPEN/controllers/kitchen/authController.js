// controllers/kitchen/authController.js
const jwt = require("jsonwebtoken");
const Branch = require("../../models/admin/Branch");

const kitchenLogin = async (req, res) => {
  try {
    const { pincode, password } = req.body;

    if (!pincode || !password) {
      return res.status(400).json({
        success: false,
        message: "Pincode and password are required",
      });
    }

    // Find branch by pincode
    const branch = await Branch.findOne({ "address.pincode": pincode });

    if (!branch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await branch.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: branch._id,
        pincode: branch.address.pincode,
        branchName: branch.name,
      },
      process.env.JWT_SECRET_KITCHEN,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        branch: {
          id: branch._id,
          name: branch.name,
          address: {
            city: branch.address.city,
            state: branch.address.state,
            pincode: branch.address.pincode,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

const getBranchDetails = async (req, res) => {
  try {
    const branch = await Branch.findById(req.branch.id).select("-password");

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: branch._id,
        name: branch.name,
        address: {
          city: branch.address.city,
          state: branch.address.state,
          pincode: branch.address.pincode,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching branch details",
      error: error.message,
    });
  }
};

module.exports = {
  kitchenLogin,
  getBranchDetails,
};
