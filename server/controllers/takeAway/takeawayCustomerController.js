// controllers/takeaway/takeawayCustomerController.js
const Branch = require("../../models/admin/Branch");
const TakeAwayConfig = require("../../models/admin/TakeAway");
const TakeAwayOrder = require("../../models/takeAway/TakeAwayOrder");
const TakeAwayToken = require("../../models/takeAway/TakeAwayToken");
const Item = require("../../models/admin/Item");

// Validate QR code access
const validateTakeAwayAccess = async (req, res) => {
  try {
    const { pincode } = req.params;
    console.log("Validating takeaway access for pincode:", pincode);

    // Find branch by pincode
    const branch = await Branch.findOne({ "address.pincode": pincode });
    if (!branch) {
      console.log("Branch not found for pincode:", pincode);
      return res.status(404).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    // Find takeaway config for the branch
    const takeawayConfig = await TakeAwayConfig.findOne({
      branchId: branch._id,
      isEnabled: true,
    });

    if (!takeawayConfig) {
      console.log("Takeaway not enabled for branch:", branch._id);
      return res.status(404).json({
        success: false,
        message: "Takeaway not available for this branch",
      });
    }

    console.log("Takeaway access validated for branch:", branch.name);

    res.json({
      success: true,
      branch: {
        id: branch._id,
        name: branch.name,
        address: branch.address,
        coordinates: branch.address.coordinates,
      },
    });
  } catch (error) {
    console.error("Error in validateTakeAwayAccess:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get takeaway menu items (only items with dining service)
const getTakeAwayMenuItems = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log("Fetching takeaway menu items for branchId:", branchId);

    // Find branch for currency
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    console.log("Branch currency:", branch.address.currency);

    // Get all items that are available for dining service
    const diningQuery = {
      available: true,
      "services.dining": true,
    };

    console.log("Query for dining items:", JSON.stringify(diningQuery));

    // First count total matching items
    const totalDiningItems = await Item.countDocuments(diningQuery);
    console.log(`Total items with dining service enabled: ${totalDiningItems}`);

    const items = await Item.find(diningQuery).populate("category", "name");

    console.log(`Found ${items.length} dining items`);

    // Log item details for debugging
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`- ID: ${item._id}`);
      console.log(`- Name: ${item.nameEnglish}`);
      console.log(
        `- Category: ${item.category ? item.category.name : "Uncategorized"}`
      );
      console.log(`- Available: ${item.available}`);
      console.log(`- Dining service: ${item.services.dining}`);
      console.log(`- Prices: ${JSON.stringify(item.prices)}`);
      console.log(
        `- Macros: Calories=${item.calories}, Protein=${item.protein}, Carbs=${item.carbs}, Fat=${item.fat}`
      );

      // Check if item has a price for the branch currency
      const hasBranchCurrencyPrice = item.prices.some(
        (p) => p.currency === branch.address.currency
      );
      console.log(
        `- Has price in branch currency (${branch.address.currency}): ${hasBranchCurrencyPrice}`
      );
    });

    // Group items by category
    const categorizedItems = {};
    items.forEach((item) => {
      const categoryName = item.category ? item.category.name : "Uncategorized";

      // Find correct price for branch currency
      const price = item.prices.find(
        (p) => p.currency === branch.address.currency
      );

      if (!categorizedItems[categoryName]) {
        categorizedItems[categoryName] = [];
      }

      // If no matching currency price found, try to use the first available price
      const fallbackPrice =
        item.prices.length > 0 ? item.prices[0].sellingPrice : 0;

      // Add additional macro information to the item data
      categorizedItems[categoryName].push({
        id: item._id,
        nameEnglish: item.nameEnglish,
        nameArabic: item.nameArabic,
        image: item.image,
        price: price?.sellingPrice || fallbackPrice,
        priceCurrency:
          price?.currency ||
          (item.prices.length > 0
            ? item.prices[0].currency
            : branch.address.currency),
        discountPrice: price?.discountPrice,
        type: item.type,
        // Include macros in the response
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      });
    });

    // Log categorized items for debugging
    console.log("Categories found:", Object.keys(categorizedItems));
    Object.keys(categorizedItems).forEach((category) => {
      console.log(
        `Category ${category} has ${categorizedItems[category].length} items`
      );
    });

    // Convert to array format
    const formattedCategories = Object.keys(categorizedItems).map(
      (categoryName) => ({
        name: categoryName,
        items: categorizedItems[categoryName],
      })
    );

    console.log(`Sending ${formattedCategories.length} categories with items`);

    // Log the actual response data
    console.log(
      "Response data structure:",
      JSON.stringify({
        success: true,
        data: formattedCategories.map((cat) => ({
          name: cat.name,
          itemCount: cat.items.length,
        })),
        currency: branch.address.currency,
        totalItems: items.length,
      })
    );

    res.json({
      success: true,
      data: formattedCategories,
      currency: branch.address.currency,
    });
  } catch (error) {
    console.error("Error in getTakeAwayMenuItems:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching takeaway menu items",
      error: error.message,
    });
  }
};

// Get specific item details
const getMenuItemDetails = async (req, res) => {
  try {
    const { branchId, itemId } = req.params;
    console.log(`Getting details for item ${itemId} in branch ${branchId}`);

    // Get branch for currency
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    console.log(
      "Getting item details for branch currency:",
      branch.address.currency
    );

    // Get item with full details
    const item = await Item.findOne({
      _id: itemId,
      available: true,
      "services.dining": true,
    });

    if (!item) {
      console.log(`Item ${itemId} not found or not available for takeaway`);
      return res.status(404).json({
        success: false,
        message: "Item not found or unavailable for takeaway",
      });
    }

    // Log item details for debugging
    console.log("Item details:");
    console.log(`- Name: ${item.nameEnglish}`);
    console.log(`- Available: ${item.available}`);
    console.log(`- Dining service: ${item.services.dining}`);
    console.log(`- Prices: ${JSON.stringify(item.prices)}`);
    console.log(
      `- Macros: Calories=${item.calories}, Protein=${item.protein}, Carbs=${item.carbs}, Fat=${item.fat}`
    );

    // Find correct price for branch currency
    const price = item.prices.find(
      (p) => p.currency === branch.address.currency
    );

    // If no matching currency price found, try to use the first available price
    const fallbackPrice =
      item.prices.length > 0 ? item.prices[0].sellingPrice : 0;
    const priceCurrency =
      price?.currency ||
      (item.prices.length > 0
        ? item.prices[0].currency
        : branch.address.currency);

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
      price: price?.sellingPrice || fallbackPrice,
      priceCurrency: priceCurrency,
      discountPrice: price?.discountPrice,
      currency: branch.address.currency,
    };

    console.log(
      "Sending formatted item with nutrition facts:",
      JSON.stringify(formattedItem.nutritionFacts)
    );

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

// Generate token for order
const generateToken = async (branchId) => {
  try {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }

    const pincode = branch.address.pincode;

    // Create date prefix (MMDD format)
    const now = new Date();
    const datePrefix = `${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}`;

    // Get or create token counter for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let tokenCounter = await TakeAwayToken.findOne({
      branchId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    if (!tokenCounter) {
      tokenCounter = new TakeAwayToken({
        branchId,
        date: now,
        lastTokenNumber: 0,
      });
    }

    // Increment counter
    tokenCounter.lastTokenNumber += 1;
    await tokenCounter.save();

    // Format sequence with leading zeros
    const sequence = String(tokenCounter.lastTokenNumber).padStart(3, "0");

    // Return simple and full token
    return {
      simpleToken: sequence,
      fullToken: `${pincode}-${datePrefix}-${sequence}`,
    };
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

// Create takeaway order
const createTakeAwayOrder = async (req, res) => {
  try {
    const { branchId, items, totalAmount, customerName, customerPhone, notes } =
      req.body;

    // Validate required fields
    if (
      !branchId ||
      !items ||
      !totalAmount ||
      !customerName ||
      !customerPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find branch
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Check if takeaway is enabled for the branch
    const takeawayConfig = await TakeAwayConfig.findOne({
      branchId,
      isEnabled: true,
    });

    if (!takeawayConfig) {
      return res.status(404).json({
        success: false,
        message: "Takeaway not available for this branch",
      });
    }

    // Generate token
    const { simpleToken, fullToken } = await generateToken(branchId);

    // Create order
    const takeawayOrder = new TakeAwayOrder({
      branchId,
      tokenNumber: simpleToken,
      fullToken,
      customerName,
      customerPhone,
      items,
      totalAmount,
      notes,
      status: "pending",
      paymentStatus: "pending",
    });

    // Save order
    await takeawayOrder.save();

    res.status(201).json({
      success: true,
      message: "Takeaway order created successfully",
      data: {
        orderToken: simpleToken,
        orderDetails: takeawayOrder,
      },
    });
  } catch (error) {
    console.error("Error in createTakeAwayOrder:", error);
    res.status(500).json({
      success: false,
      message: "Error creating takeaway order",
      error: error.message,
    });
  }
};

// Get order status by token
const getOrderStatus = async (req, res) => {
  try {
    const { token } = req.params;

    let query = {};

    // Check if it's a simple token (just numbers) or full token
    if (/^\d+$/.test(token)) {
      // Simple token (sequence only)
      // Get today's date (MMDD format)
      const now = new Date();
      const datePrefix = `${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}${String(now.getDate()).padStart(2, "0")}`;

      // Find all branches
      const branches = await Branch.find();
      const possibleTokens = [];

      // Create possible full tokens by combining with all branch pincodes
      for (const branch of branches) {
        const pincode = branch.address.pincode;
        possibleTokens.push(
          `${pincode}-${datePrefix}-${token.padStart(3, "0")}`
        );
      }

      query = { fullToken: { $in: possibleTokens } };
    } else {
      // Full token format
      query = { fullToken: token };
    }

    const order = await TakeAwayOrder.findOne(query)
      .populate("branchId", "name address")
      .populate("items.itemId", "nameEnglish nameArabic image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Format order for response
    const formattedOrder = {
      id: order._id,
      token: order.tokenNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      branchName: order.branchId.name,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.itemId?.image || "",
      })),
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      notes: order.notes,
    };

    res.json({
      success: true,
      data: formattedOrder,
    });
  } catch (error) {
    console.error("Error in getOrderStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order status",
      error: error.message,
    });
  }
};

module.exports = {
  validateTakeAwayAccess,
  getTakeAwayMenuItems,
  getMenuItemDetails,
  createTakeAwayOrder,
  getOrderStatus,
};
