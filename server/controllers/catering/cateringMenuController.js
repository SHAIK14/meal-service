const Branch = require("../../models/admin/Branch");
const CateringConfig = require("../../models/admin/CateringConfig");
const CateringOrder = require("../../models/catering/CateringOrder");
const Item = require("../../models/admin/Item");

// Validate QR code access
const validateCateringAccess = async (req, res) => {
  try {
    const { pincode } = req.params;

    // Find branch by pincode
    const branch = await Branch.findOne({ "address.pincode": pincode });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    // Find catering config
    const cateringConfig = await CateringConfig.findOne({
      branchId: branch._id,
      isEnabled: true,
    });

    if (!cateringConfig) {
      return res.status(404).json({
        success: false,
        message: "Catering not available for this branch",
      });
    }

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
    console.error("Error in validateCateringAccess:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get catering menu items (only items with indoorCatering or outdoorCatering)
// Get catering menu items (only items with indoorCatering or outdoorCatering)
const getCateringMenuItems = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log("Fetching catering menu items for branchId:", branchId);

    // Find branch for currency
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Log branch currency for debugging
    console.log("Branch currency:", branch.address.currency);

    // Get all items that are available for catering
    const items = await Item.find({
      available: true,
      $or: [
        { "services.indoorCatering": true },
        { "services.outdoorCatering": true },
      ],
    }).populate("category", "name");

    console.log(`Found ${items.length} catering items`);

    // Debug the first few items to see what's going on with prices
    if (items.length > 0) {
      console.log("First item details:", {
        id: items[0]._id,
        name: items[0].nameEnglish,
        pricesArray: items[0].prices, // Log the entire prices array
        currency: branch.address.currency,
      });
    }

    // Group items by category
    const categorizedItems = {};
    items.forEach((item) => {
      const categoryName = item.category ? item.category.name : "Uncategorized";

      // Find correct price for branch currency
      const price = item.prices.find(
        (p) => p.currency === branch.address.currency
      );

      // Log details about price finding for debugging
      console.log(`Price matching for ${item.nameEnglish}:`, {
        foundPrice: !!price,
        matchingCurrency: price ? price.currency : "none",
        sellingPrice: price ? price.sellingPrice : 0,
        availableCurrencies: item.prices.map((p) => p.currency),
      });

      if (!categorizedItems[categoryName]) {
        categorizedItems[categoryName] = [];
      }

      // If no matching currency price found, try to use the first available price
      const fallbackPrice =
        item.prices.length > 0 ? item.prices[0].sellingPrice : 0;

      categorizedItems[categoryName].push({
        id: item._id,
        nameEnglish: item.nameEnglish,
        nameArabic: item.nameArabic,
        image: item.image,
        price: price?.sellingPrice || fallbackPrice, // Use fallback if no matching currency
        priceCurrency:
          price?.currency ||
          (item.prices.length > 0
            ? item.prices[0].currency
            : branch.address.currency),
        discountPrice: price?.discountPrice,
        type: item.type,
        calories: item.calories,
        indoorCatering: item.services.indoorCatering,
        outdoorCatering: item.services.outdoorCatering,
      });
    });

    // Convert to array format
    const formattedCategories = Object.keys(categorizedItems).map(
      (categoryName) => ({
        name: categoryName,
        items: categorizedItems[categoryName],
      })
    );

    res.json({
      success: true,
      data: formattedCategories,
      currency: branch.address.currency,
    });
  } catch (error) {
    console.error("Error in getCateringMenuItems:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching catering menu items",
      error: error.message,
    });
  }
};

// Get specific item details
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

    console.log(
      "Getting item details for branch currency:",
      branch.address.currency
    );

    // Get item with full details
    const item = await Item.findOne({
      _id: itemId,
      available: true,
      $or: [
        { "services.indoorCatering": true },
        { "services.outdoorCatering": true },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found or unavailable for catering",
      });
    }

    // Log the prices array for debugging
    console.log(`Item ${item._id} (${item.nameEnglish}) prices:`, item.prices);

    // Find correct price for branch currency
    const price = item.prices.find(
      (p) => p.currency === branch.address.currency
    );

    // Log the price finding result
    console.log("Price finding result:", {
      foundMatchingPrice: !!price,
      currency: branch.address.currency,
      selectedPrice: price
        ? price.sellingPrice
        : item.prices.length > 0
        ? item.prices[0].sellingPrice
        : 0,
    });

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
      indoorCatering: item.services.indoorCatering,
      outdoorCatering: item.services.outdoorCatering,
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

// Create catering order
const createCateringOrder = async (req, res) => {
  try {
    const {
      branchId,
      items,
      totalAmount,
      cateringType,
      numberOfPeople,
      referralSource,
      staffName,
      customerName,
      customerContact,
      notes,
      eventDate,
      eventTime,
    } = req.body;

    // Validate required fields
    if (
      !branchId ||
      !items ||
      !totalAmount ||
      !cateringType ||
      !numberOfPeople ||
      !referralSource ||
      !customerName ||
      !customerContact ||
      !eventDate ||
      !eventTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate referral info
    if (referralSource === "staff" && !staffName) {
      return res.status(400).json({
        success: false,
        message: "Staff name is required when referral source is staff",
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

    // Check if catering is enabled for the branch
    const cateringConfig = await CateringConfig.findOne({
      branchId,
      isEnabled: true,
    });

    if (!cateringConfig) {
      return res.status(404).json({
        success: false,
        message: "Catering not available for this branch",
      });
    }

    // Create order
    const cateringOrder = new CateringOrder({
      branchId,
      items,
      totalAmount,
      cateringType,
      numberOfPeople,
      referralSource,
      staffName: referralSource === "staff" ? staffName : undefined,
      customerName,
      customerContact,
      notes,
      eventDate: new Date(eventDate),
      eventTime,
      status: "pending",
    });

    // Save order
    await cateringOrder.save();

    res.status(201).json({
      success: true,
      message: "Catering order created successfully",
      data: cateringOrder,
    });
  } catch (error) {
    console.error("Error in createCateringOrder:", error);
    res.status(500).json({
      success: false,
      message: "Error creating catering order",
      error: error.message,
    });
  }
};

// Get catering orders for a branch (for kitchen dashboard)
const getBranchCateringOrders = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status } = req.query;

    console.log("Fetching catering orders for branchId:", branchId);

    // Validate branchId
    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Branch ID is required",
      });
    }

    // Build query
    const query = { branchId };
    if (status) {
      query.status = status;
    }

    // Find orders and populate item details
    const orders = await CateringOrder.find(query)
      .populate({
        path: "items.itemId",
        model: "Item",
        select: "nameEnglish nameArabic image",
      })
      .sort({ eventDate: 1, eventTime: 1, createdAt: -1 });

    // Transform orders to include item details
    const transformedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map((item) => ({
        _id: item._id,
        itemId: item.itemId._id,
        nameEnglish: item.itemId.nameEnglish,
        nameArabic: item.itemId.nameArabic,
        image: item.itemId.image,
        price: item.price,
        quantity: item.quantity,
      }));
      return orderObj;
    });

    res.json({
      success: true,
      data: {
        orders: transformedOrders,
      },
    });
  } catch (error) {
    console.error("ERROR in getBranchCateringOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching catering orders",
      error: error.message,
    });
  }
};

// Update catering order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "accepted",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Update order status
    const order = await CateringOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate({
      path: "items.itemId",
      select: "nameEnglish nameArabic image",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      data: order,
    });
  } catch (error) {
    console.error(`Error updating catering order status:`, error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

module.exports = {
  validateCateringAccess,
  getCateringMenuItems,
  getMenuItemDetails,
  createCateringOrder,
  getBranchCateringOrders,
  updateOrderStatus,
};
