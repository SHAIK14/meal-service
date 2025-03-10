import { create } from "zustand";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../api/authApi";

const useCartStore = create((set, get) => ({
  // State
  items: [],
  loading: false,
  error: null,
  cartTotal: 0,
  itemCount: 0,

  // Calculate totals
  calculateTotals: (items) => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return { itemCount, cartTotal };
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch cart
  fetchCart: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getCart();
      const items = response.data.items || [];
      const { itemCount, cartTotal } = get().calculateTotals(items);

      set({
        items,
        itemCount,
        cartTotal,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch cart",
      });
    }
  },

  // Update item quantity (add, update, or remove)
  updateItem: async (itemId, quantity) => {
    try {
      set({ loading: true, error: null });

      // Get current cart state
      const { items: currentItems } = get();

      // Find if item is already in cart
      const existingItem = currentItems.find(
        (item) => item.item._id === itemId
      );

      let response;
      if (quantity <= 0) {
        // Remove item if quantity is 0
        response = await removeFromCart(itemId);
      } else if (!existingItem) {
        // Add new item if not in cart
        response = await addToCart(itemId, quantity);
      } else {
        // Update existing item quantity
        response = await updateCartItem(itemId, quantity);
      }

      const items = response.data.items || [];
      const { itemCount, cartTotal } = get().calculateTotals(items);

      set({
        items,
        itemCount,
        cartTotal,
        loading: false,
      });

      return true;
    } catch (error) {
      console.error("Error updating cart item:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to update cart item",
      });
      return false;
    }
  },

  // Add item to cart
  addItem: async (itemId, quantity) => {
    try {
      set({ loading: true, error: null });

      // Get current cart state
      const { items: currentItems } = get();

      // Find if item is already in cart
      const existingItem = currentItems.find(
        (item) => item.item._id === itemId
      );

      let response;
      if (existingItem) {
        // If item exists, update quantity
        const newQuantity = existingItem.quantity + quantity;
        response = await updateCartItem(itemId, newQuantity);
      } else {
        // Add new item
        response = await addToCart(itemId, quantity);
      }

      const items = response.data.items || [];
      const { itemCount, cartTotal } = get().calculateTotals(items);

      set({
        items,
        itemCount,
        cartTotal,
        loading: false,
      });

      return true;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to add item to cart",
      });
      return false;
    }
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    try {
      set({ loading: true, error: null });
      const response = await removeFromCart(itemId);
      const items = response.data.items || [];
      const { itemCount, cartTotal } = get().calculateTotals(items);

      set({
        items,
        itemCount,
        cartTotal,
        loading: false,
      });

      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to remove item from cart",
      });
      return false;
    }
  },

  // Clear cart
  clearCartItems: async () => {
    try {
      set({ loading: true, error: null });
      await clearCart();

      set({
        items: [],
        itemCount: 0,
        cartTotal: 0,
        loading: false,
      });

      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to clear cart",
      });
      return false;
    }
  },
}));

export default useCartStore;
