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
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting category", error: error.message });
  }
};
