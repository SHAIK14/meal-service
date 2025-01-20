const Branch = require("../../models/admin/Branch");
const Dining = require("../../models/admin/DiningConfig");
const DiningOrder = require("../../models/menu/DiningOrder");

// Validate QR code access
const validateDiningAccess = async (req, res) => {
  try {
    const { pincode, tableName } = req.params;
    console.log("Validating access for:", { pincode, tableName });

    // Find branch by pincode
    const branch = await Branch.findOne({ "address.pincode": pincode });
    if (!branch) {
      console.log("Branch not found for pincode:", pincode);
      return res.status(404).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    // Find dining config and check if table exists and is enabled
    const diningConfig = await Dining.findOne({
      branchId: branch._id,
      "tables.name": tableName,
      "tables.isEnabled": true,
    });

    if (!diningConfig) {
      console.log("Table not found or disabled for branch:", branch._id);
      return res.status(404).json({
        success: false,
        message: "Table not found or disabled",
      });
    }

    console.log("Access validated successfully for branch:", branch.name);
    res.json({
      success: true,
      branch: {
        id: branch._id,
        name: branch.name,
        address: branch.address,
      },
    });
  } catch (error) {
    console.error("Error in validateDiningAccess:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get menu items for a branch (using dummy data for now)
const getDiningMenuItems = async (req, res) => {
  try {
    // For now, return dummy data
    const dummyItems = [
      {
        id: 1,
        name: "Butter Chicken",
        description: "Creamy curry with tender chicken",
        price: 15.99,
        category: "Main Course",
        type: "non-veg",
        rating: 4.5,
      },
      // Add more dummy items
    ];

    res.json({
      success: true,
      data: dummyItems,
    });
  } catch (error) {
    console.error("Error in getDiningMenuItems:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu items",
    });
  }
};

// Get specific item details (using dummy data for now)
const getMenuItemDetails = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Return dummy data
    const dummyItem = {
      id: itemId,
      name: "Butter Chicken",
      description: "Creamy curry with tender chicken",
      price: 15.99,
      category: "Main Course",
      type: "non-veg",
      rating: 4.5,
    };

    res.json({
      success: true,
      data: dummyItem,
    });
  } catch (error) {
    console.error("Error in getMenuItemDetails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching item details",
    });
  }
};

// Create new dining order
const createDiningOrder = async (req, res) => {
  try {
    const { branchId, tableName, items, totalAmount } = req.body;

    // Validate branch and table exist
    const diningConfig = await Dining.findOne({
      branchId,
      "tables.name": tableName,
      "tables.isEnabled": true,
    });

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "Invalid branch or table",
      });
    }

    // Create new dining order
    const diningOrder = new DiningOrder({
      branchId,
      tableName,
      items,
      totalAmount,
      status: "pending",
    });

    await diningOrder.save();
    console.log("New dining order created:", diningOrder._id);

    res.status(201).json({
      success: true,
      message: "Dining order created successfully",
      data: diningOrder,
    });
  } catch (error) {
    console.error("Error in createDiningOrder:", error);
    res.status(500).json({
      success: false,
      message: "Error creating dining order",
    });
  }
};

module.exports = {
  validateDiningAccess,
  getDiningMenuItems,
  getMenuItemDetails,
  createDiningOrder,
};
