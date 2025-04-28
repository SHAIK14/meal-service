// controllers/mobile/addressController.js
const MobileUser = require("../../models/Mobile/MobileUser");
const axios = require("axios");

// Get user addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await MobileUser.findById(req.user.id).select("addresses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const {
      name,
      address,
      apartment,
      city,
      state,
      pincode,
      coordinates,
      isDefault,
    } = req.body;

    if (!address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Address, city, state, and pincode are required",
      });
    }

    const user = await MobileUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create new address object
    const newAddress = {
      name: name || user.name || "Home",
      address,
      apartment: apartment || "",
      city,
      state,
      pincode,
      coordinates: coordinates || { latitude: 0, longitude: 0 },
      isDefault: isDefault || false,
    };

    // If this is the first address or set as default, update other addresses
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    // Add new address
    user.addresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Add address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const {
      name,
      address,
      apartment,
      city,
      state,
      pincode,
      coordinates,
      isDefault,
    } = req.body;

    const user = await MobileUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the address
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update address fields
    if (name) user.addresses[addressIndex].name = name;
    if (address) user.addresses[addressIndex].address = address;
    if (apartment !== undefined)
      user.addresses[addressIndex].apartment = apartment;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (pincode) user.addresses[addressIndex].pincode = pincode;
    if (coordinates) user.addresses[addressIndex].coordinates = coordinates;

    // Handle default address
    if (isDefault) {
      user.addresses.forEach((addr, index) => {
        addr.isDefault = index === addressIndex;
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await MobileUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the address
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Check if deleting default address
    const wasDefault = user.addresses[addressIndex].isDefault;

    // Remove address
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, set a new default if available
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await MobileUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the address
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update default status
    user.addresses.forEach((addr, index) => {
      addr.isDefault = index === addressIndex;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};

// Geocode address using Google Maps API
exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      return res.status(400).json({
        success: false,
        message: "Failed to geocode address",
        error: response.data.status,
      });
    }

    const result = response.data.results[0];
    const coordinates = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };

    // Extract address components
    let addressDetails = {
      formattedAddress: result.formatted_address,
      coordinates,
    };

    // Extract specific components like city, state, etc.
    result.address_components.forEach((component) => {
      if (component.types.includes("locality")) {
        addressDetails.city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        addressDetails.state = component.long_name;
      } else if (component.types.includes("postal_code")) {
        addressDetails.pincode = component.long_name;
      }
    });

    return res.status(200).json({
      success: true,
      data: addressDetails,
    });
  } catch (error) {
    console.error("Geocode error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to geocode address",
    });
  }
};
