const Item = require("../../models/admin/Item");
const Category = require("../../models/admin/Category");

exports.createItem = async (req, res) => {
  try {
    const itemData = req.body;

    // Check if the category exists
    const category = await Category.findById(itemData.category);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const newItem = new Item(itemData);
    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
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
    const { category, type, page = 1, limit = 10 } = req.query;
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

    if (type) {
      query.type = type;
    }

    const items = await Item.find(query)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalItems = await Item.countDocuments(query);

    res.json({
      success: true,
      data: items,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    console.error("Error in getAllItems:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("category");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category");
    if (!updatedItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleItemAvailability = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    item.available = !item.available;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getItemsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Find the category by name (case-insensitive)
    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, "i") },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const items = await Item.find({ category: category._id })
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalItems = await Item.countDocuments({ category: category._id });

    res.json({
      success: true,
      data: {
        data: items,
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    });
  } catch (error) {
    console.error("Error in getItemsByCategory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
