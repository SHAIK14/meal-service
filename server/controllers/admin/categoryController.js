const Category = require("../../models/admin/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    console.log("Categories from database:", categories); // Log the categories
    res.status(200).json(categories); // Send just the array of categories
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
