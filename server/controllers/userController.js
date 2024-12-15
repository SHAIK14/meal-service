const User = require("../models/User");
const Branch = require("../models/admin/Branch");
const { calculateDistance } = require("../utils/locationUtils");

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
    const { fullAddress, flatNumber, landmark, saveAs, coordinates, country } =
      req.body;

    // Basic validation
    if (!fullAddress || !flatNumber || !saveAs || !coordinates || !country) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Find all branches in user's country
    const branches = await Branch.find({
      "address.country": country,
    });

    if (!branches.length) {
      return res.status(400).json({
        message: `Sorry, we don't operate in ${country} yet`,
      });
    }

    // Find closest branch within service radius
    let closestBranch = null;
    let shortestDistance = Infinity;

    for (const branch of branches) {
      const distance = calculateDistance(
        coordinates.coordinates[1],
        coordinates.coordinates[0],
        branch.address.coordinates.latitude,
        branch.address.coordinates.longitude
      );

      if (distance <= branch.serviceRadius && distance < shortestDistance) {
        closestBranch = branch;
        shortestDistance = distance;
      }
    }

    if (!closestBranch) {
      return res.status(400).json({
        message: "Your location is not within our service area",
      });
    }

    // Update user
    const user = req.user;

    user.address = {
      fullAddress,
      flatNumber,
      landmark: landmark || "",
      saveAs,
      coordinates: {
        type: "Point",
        coordinates: coordinates.coordinates,
      },
    };

    user.branchId = closestBranch._id;
    user.distanceToBranch = shortestDistance;

    if (user.status === "INFO_COMPLETE") {
      user.status = "ADDRESS_COMPLETE";
    }

    await user.save();

    res.json({
      message: "Address updated successfully",
      user: {
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        status: user.status,
        assignedBranch: {
          id: closestBranch._id,
          name: closestBranch.name,
          distance: shortestDistance,
        },
      },
      isInfoComplete: ["INFO_COMPLETE", "ADDRESS_COMPLETE"].includes(
        user.status
      ),
      isAddressComplete: user.status === "ADDRESS_COMPLETE",
    });
  } catch (error) {
    console.error("Error in updateUserAddress:", error);
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
exports.getUserAddress = async (req, res) => {
  try {
    const user = req.user;
    if (user.address) {
      const { fullAddress, flatNumber, landmark, saveAs, coordinates } =
        user.address;

      res.json({
        address: {
          fullAddress,
          flatNumber,
          landmark,
          saveAs,
          coordinates,
        },
      });
    } else {
      res.status(404).json({ message: "User address not found" });
    }
  } catch (error) {
    console.error("Error in getUserAddress:", error);
    res.status(500).json({ message: "Server error" });
  }
};
