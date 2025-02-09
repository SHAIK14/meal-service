// controllers/admin/diningController.js
const DiningCategory = require("../../models/admin/DiningCategory");
const Item = require("../../models/admin/Item");

// Create dining category
exports.createDiningCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    // Check if category already exists
    const existingCategory = await DiningCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = new DiningCategory({
      name,
      image,
    });

    await category.save();

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error in createDiningCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error creating dining category",
      error: error.message,
    });
  }
};

// Get all dining categories
exports.getAllDiningCategories = async (req, res) => {
  try {
    const categories = await DiningCategory.find()
      .populate({
        path: "items",
        select: "nameEnglish nameArabic image available",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error in getAllDiningCategories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dining categories",
      error: error.message,
    });
  }
};

// Add items to category
exports.addItemsToCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { itemIds } = req.body;

    const category = await DiningCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Dining category not found",
      });
    }

    // Add new items
    category.items = [...new Set([...category.items, ...itemIds])];
    await category.save();

    const updatedCategory = await DiningCategory.findById(categoryId).populate({
      path: "items",
      select: "nameEnglish nameArabic image available",
    });

    res.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error in addItemsToCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error adding items to category",
      error: error.message,
    });
  }
};

// Remove items from category
exports.removeItemFromCategory = async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;

    const category = await DiningCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Dining category not found",
      });
    }

    category.items = category.items.filter(
      (item) => item.toString() !== itemId
    );
    await category.save();

    res.json({
      success: true,
      message: "Item removed from category successfully",
    });
  } catch (error) {
    console.error("Error in removeItemFromCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error removing item from category",
      error: error.message,
    });
  }
};

// Delete dining category
exports.deleteDiningCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await DiningCategory.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Dining category not found",
      });
    }

    res.json({
      success: true,
      message: "Dining category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteDiningCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting dining category",
      error: error.message,
    });
  }
};
exports.getDiningCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await DiningCategory.findById(id).populate({
      path: "items",
      select: "nameEnglish nameArabic image available",
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Dining category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error in getDiningCategoryById:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dining category",
      error: error.message,
    });
  }
};
