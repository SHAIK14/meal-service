const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Driver = require("../../models/admin/DriverRegister");

exports.driverLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const driver = await Driver.findOne({
      "personalDetails.nationalId": username,
      status: "approved",
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if using temporary or permanent password
    const isTemp =
      driver.authDetails.temporaryPassword &&
      (await bcrypt.compare(password, driver.authDetails.password));
    const isPerm =
      !driver.authDetails.temporaryPassword &&
      (await bcrypt.compare(password, driver.authDetails.password));

    if (!isTemp && !isPerm) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { driverId: driver.driverId },
      process.env.JWT_SECRET_DRIVER,
      { expiresIn: "24h" }
    );

    // Update last login time
    driver.authDetails.lastLogin = new Date();
    await driver.save();

    res.status(200).json({
      success: true,
      token,
      requirePasswordChange: isTemp || driver.authDetails.isFirstLogin,
      driverId: driver.driverId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const driver = await Driver.findOne({ driverId: req.driver.driverId });

    // Verify old password
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      driver.authDetails.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    driver.authDetails.password = hashedPassword;
    driver.authDetails.temporaryPassword = null;
    driver.authDetails.isFirstLogin = false;

    await driver.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
