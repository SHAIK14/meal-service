// controllers/mobile/cartController.js
const Cart = require("../../models/Mobile/Cart");
const Item = require("../../models/admin/Item");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.item",
      select: "nameEnglish image type prices",
    });

    if (!cart) {
      cart = { items: [] };
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Item ID and quantity (min 1) are required",
      });
    }

    // Get item details to get the price
    const item = await Item.findById(itemId);
    if (!item || !item.available || !item.services.dining) {
      return res.status(404).json({
        success: false,
        message: "Item not found or not available",
      });
    }

    // Get current price
    const price = item.prices[0].sellingPrice;

    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({
        user: req.user.id,
        items: [{ item: itemId, quantity, price }],
      });
    } else {
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (cartItem) => cartItem.item.toString() === itemId
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity = quantity;
      } else {
        // Add new item to cart
        cart.items.push({ item: itemId, quantity, price });
      }

      await cart.save();
    }

    // Return updated cart
    cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.item",
      select: "nameEnglish image type prices",
    });

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Item ID and quantity are required",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in cart
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.item.toString() === itemId
    );

    if (existingItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(existingItemIndex, 1);
    } else {
      // Update quantity
      cart.items[existingItemIndex].quantity = quantity;
    }

    await cart.save();

    // Return updated cart
    cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.item",
      select: "nameEnglish image type prices",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (cartItem) => cartItem.item.toString() !== itemId
    );

    await cart.save();

    // Return updated cart
    cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.item",
      select: "nameEnglish image type prices",
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    // Find and delete user's cart
    await Cart.findOneAndDelete({ user: req.user.id });

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: { items: [] },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};
