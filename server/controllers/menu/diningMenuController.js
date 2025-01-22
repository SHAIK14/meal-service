const Branch = require("../../models/admin/Branch");
const Dining = require("../../models/admin/DiningConfig");
const DiningOrder = require("../../models/menu/DiningOrder");
const DiningCategory = require("../../models/admin/DiningCategory");
const Item = require("../../models/admin/Item");
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

// Get all dining categories with items for a branch
const getDiningMenuItems = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log("Fetching menu items for branchId:", branchId);

    // Get all active categories with their items
    const categories = await DiningCategory.find({ active: true }).populate({
      path: "items",
      match: { available: true }, // Only get available items
    });

    console.log("Categories found:", categories.length);

    // Just format the basic data we need
    const formattedCategories = categories
      .map((category) => ({
        id: category._id,
        name: category.name,
        image: category.image,
        items: category.items.map((item) => ({
          id: item._id,
          nameEnglish: item.nameEnglish,
          nameArabic: item.nameArabic,
          image: item.image,
          price: item.prices[0].sellingPrice, // Take the first price
          type: item.type,
          calories: item.calories,
        })),
      }))
      .filter((category) => category.items.length > 0); // Only return categories with items

    console.log(
      "Sending categories with items:",
      formattedCategories.map((cat) => `${cat.name}: ${cat.items.length} items`)
    );

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error("Error in getDiningMenuItems:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu items",
      error: error.message,
    });
  }
};
// Get specific item details
const getMenuItemDetails = async (req, res) => {
  try {
    const { branchId, itemId } = req.params;

    // Get branch for currency
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Get item with full details
    const item = await Item.findOne({
      _id: itemId,
      available: true,
      "services.dining": true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found or unavailable",
      });
    }

    // Find correct price for branch currency
    const price = item.prices.find(
      (p) => p.currency === branch.address.currency
    );

    const formattedItem = {
      id: item._id,
      nameEnglish: item.nameEnglish,
      nameArabic: item.nameArabic,
      descriptionEnglish: item.descriptionEnglish,
      descriptionArabic: item.descriptionArabic,
      image: item.image,
      nutritionFacts: {
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      },
      type: item.type,
      price: price?.sellingPrice || 0,
      discountPrice: price?.discountPrice,
      currency: branch.address.currency,
    };

    res.json({
      success: true,
      data: formattedItem,
    });
  } catch (error) {
    console.error("Error in getMenuItemDetails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching item details",
      error: error.message,
    });
  }
};

module.exports = {
  validateDiningAccess,
  getDiningMenuItems,
  getMenuItemDetails,
  createDiningOrder,
};
