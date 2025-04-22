const Item = require("../../models/admin/Item");
const Category = require("../../models/admin/Category");
const excel = require("exceljs");

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
    // Remove limit to fetch all items

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const items = await Item.find({ category: category._id })
      .populate("category")
      .sort({ createdAt: -1 });

    const totalItems = await Item.countDocuments({ category: category._id });

    console.log(`Total items in category '${categoryName}': ${totalItems}`);
    console.log(`All ${totalItems} items are being returned`);

    res.json({
      success: true,
      items,
      totalItems,
      message: `Found ${totalItems} items in category '${categoryName}'`,
    });
  } catch (error) {
    console.error("Error in getItemsByCategory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id).populate("category");

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error("Error in getItemById:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedItem = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("category");
    if (!updatedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};

exports.toggleItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    item.available = !item.available;
    await item.save();

    res.json({
      success: true,
      message: `Item availability set to ${item.available}`,
      item,
    });
  } catch (error) {
    console.error("Error in toggleItemAvailability:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkUploadItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request. 'items' must be a non-empty array.",
      });
    }

    console.log("Received items for bulk upload:", items.length);

    // Step 1: Fetch all categories once
    const allCategories = await Category.find({});

    // Step 2: Map categories by ID and name for quick access
    const categoryMap = {};
    const categoryIdMap = {};

    allCategories.forEach((cat) => {
      // Map by name (both English and Arabic if available)
      if (cat.nameEnglish)
        categoryMap[cat.nameEnglish.trim().toLowerCase()] = cat._id;
      if (cat.nameArabic) categoryMap[cat.nameArabic.trim()] = cat._id;
      if (cat.name) categoryMap[cat.name.trim().toLowerCase()] = cat._id;

      // Map by ID
      categoryIdMap[cat._id.toString()] = cat._id;
    });

    console.log("Category mapping ready, processing items");

    const itemsToInsert = [];
    const errors = [];

    items.forEach((item, index) => {
      // Try to find category by ID first (direct match)
      let categoryId = null;

      if (item.categoryId && categoryIdMap[item.categoryId.toString()]) {
        categoryId = categoryIdMap[item.categoryId.toString()];
      }
      // Then try by name
      else if (item.categoryName) {
        const categoryName = item.categoryName.trim().toLowerCase();
        categoryId = categoryMap[categoryName];
      }

      if (!categoryId) {
        errors.push({
          index,
          nameEnglish: item.nameEnglish || "N/A",
          reason: `Category '${
            item.categoryName || item.categoryId || "unknown"
          }' not found`,
        });
        return;
      }

      // Prepare services object from flat properties
      const services = {
        subscription:
          item.subscription !== undefined ? item.subscription : false,
        indoorCatering:
          item.indoorCatering !== undefined ? item.indoorCatering : false,
        outdoorCatering:
          item.outdoorCatering !== undefined ? item.outdoorCatering : false,
        dining: item.dining !== undefined ? item.dining : false,
      };

      itemsToInsert.push({
        nameEnglish: item.nameEnglish,
        nameArabic: item.nameArabic,
        descriptionEnglish: item.descriptionEnglish,
        descriptionArabic: item.descriptionArabic,
        image: item.image || "default-image.jpg",
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        type: item.type === "Veg" ? "Veg" : "Non Veg",
        category: categoryId,
        prices: Array.isArray(item.prices)
          ? item.prices
          : [
              {
                currency: item.currency || "SAR",
                sellingPrice: Number(item.sellingPrice) || 0,
                discountPrice: item.discountPrice
                  ? Number(item.discountPrice)
                  : null,
              },
            ],
        available: item.available !== undefined ? item.available : true,
        services: services,
      });
    });

    console.log(
      `Processing complete. Valid items: ${itemsToInsert.length}, Errors: ${errors.length}`
    );

    if (itemsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid items to insert. See error list.",
        errors,
      });
    }

    const result = await Item.insertMany(itemsToInsert, {
      ordered: false,
    });

    res.status(errors.length > 0 ? 207 : 201).json({
      success: true,
      message:
        errors.length > 0
          ? `Partial success. ${result.length} items inserted, ${errors.length} failed.`
          : `All ${result.length} items inserted successfully.`,
      insertedCount: result.length,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// In your item controller file (where exports.getAllItems exists)

exports.getDashboardItems = async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 10 } = req.query;

    let query = {};

    // Apply category filter if provided
    if (category && category !== "all") {
      const categoryDoc = await Category.findOne({
        $or: [{ _id: category }, { name: category }],
      });

      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Apply type filter if provided (Veg/Non Veg)
    if (type && type !== "all") {
      query.type = type;
    }

    // Apply search filter if provided
    if (search) {
      query.$or = [
        { nameEnglish: { $regex: search, $options: "i" } },
        { nameArabic: { $regex: search, $options: "i" } },
        { descriptionEnglish: { $regex: search, $options: "i" } },
      ];
    }

    // Count total items matching the query
    const totalItems = await Item.countDocuments(query);

    console.log(`Total items found for dashboard: ${totalItems}`);
    console.log(`Applying filters: ${JSON.stringify(query)}`);

    // Fetch items with pagination and populate category information
    const items = await Item.find(query)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    console.log(`Showing ${items.length} items on page ${page}`);

    // Return results with pagination metadata
    res.json({
      success: true,
      items,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        limit: Number(limit),
        visibleItems: items.length,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardItems:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
