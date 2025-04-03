const MobileUser = require("../../models/Mobile/MobileUser");
const OTP = require("../../models/Mobile/OTP");
const jwt = require("jsonwebtoken");

// Helper function to generate OTP
const generateOTP = () => {
  // For development using static code 1234
  // In production, use: return Math.floor(1000 + Math.random() * 9000).toString();
  return "1234";
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.MOBILE_JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Send OTP to a phone number
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber, countryCode } = req.body;

    if (!phoneNumber || !countryCode) {
      return res.status(400).json({
        success: false,
        message: "Phone number and country code are required",
      });
    }

    // Check if phone number format is valid
    const phoneRegex = /^\d{9,12}$/; // Simple validation for phone numbers
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database (replaces any existing OTP for this phone)
    await OTP.findOneAndDelete({ phoneNumber, countryCode });
    await OTP.create({ phoneNumber, countryCode, otp });

    // In production, you would send the OTP via SMS here
    // For development, we'll just return success
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // DEV ONLY: Remove in production
      otp: otp,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// Verify OTP and login/register user
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, countryCode, otp } = req.body;

    if (!phoneNumber || !countryCode || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number, country code and OTP are required",
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      phoneNumber,
      countryCode,
    });

    // Check if OTP exists and matches
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid, find or create the user
    let user = await MobileUser.findOne({ phoneNumber });

    if (!user) {
      // Register new user
      user = await MobileUser.create({
        phoneNumber,
        countryCode,
        isVerified: true,
      });
    } else {
      // Update existing user
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    // Delete the used OTP
    await OTP.findOneAndDelete({ phoneNumber, countryCode });

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        name: user.name || "",
        email: user.email || "",
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await MobileUser.findById(req.user.id).select(
      "-updatedAt -__v"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await MobileUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        name: user.name || "",
        email: user.email || "",
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
    });
  }
};
