const express = require("express");
const router = express.Router();
const Item = require("../../models/Item"); // Corrected path - going up two directories
const authMiddleware = require("../../middleware/auth"); // Adjust path as needed

/**
 * @route   POST /api/items/bulk
 * @desc    Bulk upload multiple items
 * @access  Private (Admin)
 */
router.post("/bulk", authMiddleware, async (req, res) => {
  try {
    // We expect req.body to be an array for bulk upload
    // But also handle single item upload case
    const items = Array.isArray(req.body) ? req.body : [req.body];

    if (items.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No items provided for bulk upload" });
    }

    const results = [];
    const errors = [];

    // Process each item
    for (const itemData of items) {
      try {
        // Validate required fields
        if (
          !itemData.nameEnglish ||
          !itemData.nameArabic ||
          !itemData.category
        ) {
          errors.push({
            item: itemData.nameEnglish || "Unnamed item",
            error:
              "Missing required fields (nameEnglish, nameArabic, category)",
          });
          continue;
        }

        // Check if at least one service is selected
        const hasServices = Object.values(itemData.services || {}).some(
          (service) => service === true
        );
        if (!hasServices) {
          errors.push({
            item: itemData.nameEnglish,
            error: "At least one service must be selected",
          });
          continue;
        }

        // Process prices - ensure they are properly formatted
        if (itemData.prices && Array.isArray(itemData.prices)) {
          itemData.prices = itemData.prices.map((price) => ({
            currency: price.currency || "SAR",
            sellingPrice: parseFloat(price.sellingPrice) || 0,
            discountPrice: price.discountPrice
              ? parseFloat(price.discountPrice)
              : null,
          }));
        } else if (!itemData.prices) {
          // Set default price if none provided
          itemData.prices = [
            {
              currency: "SAR",
              sellingPrice: 0,
              discountPrice: null,
            },
          ];
        }

        // Create new item
        const newItem = new Item({
          nameEnglish: itemData.nameEnglish,
          nameArabic: itemData.nameArabic,
          descriptionEnglish: itemData.descriptionEnglish || "",
          descriptionArabic: itemData.descriptionArabic || "",
          image: itemData.image || "",
          calories: parseFloat(itemData.calories) || 0,
          protein: parseFloat(itemData.protein) || 0,
          carbs: parseFloat(itemData.carbs) || 0,
          fat: parseFloat(itemData.fat) || 0,
          type: itemData.type || "Non Veg",
          category: itemData.category,
          prices: itemData.prices,
          services: {
            subscription: Boolean(itemData.services?.subscription),
            indoorCatering: Boolean(itemData.services?.indoorCatering),
            outdoorCatering: Boolean(itemData.services?.outdoorCatering),
            dining: Boolean(itemData.services?.dining),
          },
          createdBy: req.user.id, // Assuming auth middleware adds user to req
        });

        // Save to database
        const savedItem = await newItem.save();

        results.push({
          item: savedItem.nameEnglish,
          id: savedItem._id,
          success: true,
        });
      } catch (itemError) {
        console.error(
          `Error processing item ${itemData.nameEnglish || "unnamed"}:`,
          itemError
        );
        errors.push({
          item: itemData.nameEnglish || "Unnamed item",
          error: itemError.message,
        });
      }
    }

    // Return results
    res.json({
      success: errors.length === 0, // Success if no errors
      message: `Processed ${items.length} items. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: "Server error processing bulk upload",
    });
  }
});

module.exports = router;
