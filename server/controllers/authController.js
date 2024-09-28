const User = require("../models/User");
const {
  DUMMY_PHONE_NUMBER,
  DUMMY_OTP,
  isOTPExpired,
} = require("../utils/otpUtils");
const { generateToken } = require("../utils/jwtUtils");

exports.requestOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const otpExpires = new Date(
      Date.now() + process.env.OTP_EXPIRY_MINUTES * 60 * 1000
    );

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({
        phoneNumber,
        status:
          phoneNumber === DUMMY_PHONE_NUMBER ? "TEST_ACCOUNT" : "NEW_USER",
      });
    }

    user.otp = DUMMY_OTP;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`Dummy OTP for ${phoneNumber}: ${DUMMY_OTP}`);

    res.json({ message: "OTP sent successfully (dummy)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (otp !== DUMMY_OTP || isOTPExpired(user.otpExpires)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.lastLogin = new Date();

    if (user.status === "NEW_USER" && phoneNumber !== DUMMY_PHONE_NUMBER) {
      user.status = "INFO_REQUIRED";
    }

    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "OTP verified successfully",
      token,
      status: user.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
