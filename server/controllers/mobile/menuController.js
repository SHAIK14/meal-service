const Item = require("../../models/admin/Item");
const Category = require("../../models/admin/Category");

/**
 * Get all menu items for dining service
 */
exports.getDiningMenuItems = async (req, res) => {
  try {
    const items = await Item.find({
      "services.dining": true,
      available: true,
    })
      .populate("category", "nameEnglish nameArabic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Menu items error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
};

/**
 * Get all categories for dining service
 */
exports.getDiningCategories = async (req, res) => {
  try {
    // First find all items with dining service
    const diningItems = await Item.find({
      "services.dining": true,
      available: true,
    }).distinct("category");

    // Then find categories that have at least one dining item
    const categories = await Category.find({
      _id: { $in: diningItems },
    }).sort({ nameEnglish: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/**
 * Get menu items by category
 */
exports.getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const items = await Item.find({
      category: categoryId,
      "services.dining": true,
      available: true,
    }).populate("category", "nameEnglish nameArabic");

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Category items error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch items for this category",
    });
  }
};

/**
 * Get menu item details
 */
exports.getItemDetails = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findOne({
      _id: itemId,
      "services.dining": true,
      available: true,
    }).populate("category", "nameEnglish nameArabic");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Item details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item details",
    });
  }
};
