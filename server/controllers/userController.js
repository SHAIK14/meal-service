const User = require("../models/User");

exports.updateUserInfo = async (req, res) => {
  try {
    const { firstName, lastName, email, gender } = req.body;
    const user = req.user;

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.gender = gender;

    if (user.status === "NEW_USER" || user.status === "INFO_REQUIRED") {
      user.status = "INFO_COMPLETE";
    }

    await user.save();

    res.json({
      message: "User information updated successfully",
      user: {
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        status: user.status,
      },
      isInfoComplete: ["INFO_COMPLETE", "ADDRESS_COMPLETE"].includes(
        user.status
      ),
      isAddressComplete: user.status === "ADDRESS_COMPLETE",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserAddress = async (req, res) => {
  try {
    const { fullAddress, saveAs, coordinates } = req.body;
    const user = req.user;

    if (!user.address) {
      user.address = {};
    }

    user.address = {
      fullAddress,
      saveAs,
      coordinates: {
        type: "Point",
        coordinates: coordinates.coordinates,
      },
    };

    if (user.status === "INFO_COMPLETE") {
      user.status = "ADDRESS_COMPLETE";
    }

    await user.save();

    res.json({
      message: "User address updated successfully",
      user: {
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        status: user.status,
      },
      isInfoComplete: ["INFO_COMPLETE", "ADDRESS_COMPLETE"].includes(
        user.status
      ),
      isAddressComplete: user.status === "ADDRESS_COMPLETE",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserStatus = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      status: user.status,
      isInfoComplete: ["INFO_COMPLETE", "ADDRESS_COMPLETE"].includes(
        user.status
      ),
      isAddressComplete: user.status === "ADDRESS_COMPLETE",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
