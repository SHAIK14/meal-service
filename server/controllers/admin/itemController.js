const Item = require("../../models/admin/Item");
const Category = require("../../models/admin/Category");

exports.createItem = async (req, res) => {
  try {
    const itemData = req.body;

    // Check if the category exists
    const category = await Category.findById(itemData.category);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }

    const newItem = new Item(itemData);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating item",
      error: error.message,
    });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    let query = {};

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      query.category = categoryDoc._id;
    }

    const items = await Item.find(query)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalItems = await Item.countDocuments(query);

    res.json({
      items,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    console.error("Error in getAllItems:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getItemsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const items = await Item.find({ category: category._id })
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalItems = await Item.countDocuments({ category: category._id });

    res.json({
      items,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    console.error("Error in getItemsByCategory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
