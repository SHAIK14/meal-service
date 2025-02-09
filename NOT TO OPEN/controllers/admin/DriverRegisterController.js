const Driver = require("../../models/admin/DriverRegister");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { generatePassword } = require("../../utils/passwordGenerator");

exports.registerDriver = async (req, res) => {
  try {
    const driverId = `DR-${uuidv4().slice(0, 8)}`;
    const driverData = {
      driverId,
      personalDetails: req.body.personalDetails,
      licenseDetails: req.body.licenseDetails,
      vehicleDetails: req.body.vehicleDetails,
      insuranceDetails: req.body.insuranceDetails,
      bankDetails: req.body.bankDetails,
      backgroundCheck: req.body.backgroundCheck,
      additionalDocuments: req.body.additionalDocuments || [],
    };

    if (req.body.personalDetails.nationality !== "saudi") {
      driverData.passportDetails = req.body.passportDetails;
    }

    const driver = new Driver(driverData);
    await driver.save();

    res.status(201).json({
      success: true,
      message: "Driver registration submitted successfully",
      driverId: driver.driverId,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const { status, nationality, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (nationality) query["personalDetails.nationality"] = nationality;
    if (search) {
      query.$or = [
        { "personalDetails.fullName": { $regex: search, $options: "i" } },
        { "personalDetails.nationalId": { $regex: search, $options: "i" } },
        { driverId: { $regex: search, $options: "i" } },
      ];
    }

    const drivers = await Driver.find(query)
      .select("-authDetails.password") // exclude hashed password
      .select("+authDetails.temporaryPassword") // explicitly include temporary password
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findOne({ driverId: req.params.id }).select(
      "-authDetails.password"
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.approveDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ driverId: req.params.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (driver.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Driver is already ${driver.status}`,
      });
    }

    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    driver.status = "approved";
    driver.approvedBy = req.admin.id;
    driver.approvalDate = new Date();
    driver.authDetails = {
      username: driver.personalDetails.nationalId,
      password: hashedPassword,
      temporaryPassword: tempPassword,
      isFirstLogin: true,
    };

    await driver.save();

    res.status(200).json({
      success: true,
      message: "Driver approved successfully",
      credentials: {
        username: driver.personalDetails.nationalId,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { driverId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOneAndDelete({ driverId: req.params.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
