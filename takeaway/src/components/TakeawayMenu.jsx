// src/components/TakeawayMenu.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  validateTakeAwayAccess,
  getTakeAwayMenuItems,
  getItemDetails,
  createTakeAwayOrder,
} from "../utils/api";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaTimes,
  FaUtensils,
  FaSearch,
} from "react-icons/fa";
import toast from "react-hot-toast";
import ItemCard from "./ItemCard";
import ItemDetailsModal from "./ItemDetailsModal";
import TokenSearch from "./TokenSearch";

const TakeawayMenu = () => {
  const { pincode } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [branchDetails, setBranchDetails] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderDetails, setOrderDetails] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Menu, 1: Form, 2: Success
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState("SAR");
  const [searchTerm, setSearchTerm] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    const validate = async () => {
      try {
        setValidating(true);
        const response = await validateTakeAwayAccess(pincode);

        if (response.success) {
          setBranchDetails(response.branch);
          fetchMenuItems(response.branch.id);
        } else {
          toast.error(response.message || "Invalid QR code");
          setTimeout(() => navigate("/"), 3000);
        }
      } catch (error) {
        console.error("Error validating pincode:", error);
        toast.error("Failed to validate QR code");
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [pincode, navigate]);

  const fetchMenuItems = async (branchId) => {
    try {
      setLoading(true);
      const response = await getTakeAwayMenuItems(branchId);

      if (response.success) {
        // Flatten categories and items
        const items = response.data.reduce((acc, category) => {
          return [
            ...acc,
            ...category.items.map((item) => ({
              ...item,
              category: category.name,
            })),
          ];
        }, []);

        setAllItems(items);
        setDisplayedItems(items);
        setCurrency(response.currency || "SAR");
      } else {
        toast.error(response.message || "Failed to fetch menu items");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on filter and search term
  useEffect(() => {
    if (allItems.length > 0) {
      let filtered = [...allItems];

      // Apply type filter
      if (activeFilter !== "all") {
        filtered = filtered.filter(
          (item) => item.type.toLowerCase() === activeFilter.toLowerCase()
        );
      }

      // Apply search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.nameEnglish.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search)
        );
      }

      setDisplayedItems(filtered);
    }
  }, [activeFilter, allItems, searchTerm]);

  const handleViewItemDetails = async (item) => {
    try {
      // If we already have detailed nutrition info, use it, otherwise fetch it
      if (!item.nutritionFacts && branchDetails) {
        const response = await getItemDetails(branchDetails.id, item.id);

        if (response.success) {
          setSelectedItem({ ...item, ...response.data });
        } else {
          setSelectedItem(item);
        }
      } else {
        setSelectedItem(item);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      setSelectedItem(item); // Fall back to basic item data
    }
  };

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });

    toast.success(`${item.nameEnglish} added to cart`);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast.success("Item removed from cart");
  };

  const getCartTotal = () => {
    return cart
      .reduce((total, item) => total + (item.price || 0) * item.quantity, 0)
      .toFixed(2);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setCheckoutStep(1);
    setShowCart(false);
  };

  const handleBackToMenu = () => {
    setCheckoutStep(0);
  };

  const handleSubmitOrder = async () => {
    // Validate form
    const requiredFields = ["customerName", "customerPhone"];

    for (const field of requiredFields) {
      if (!orderDetails[field]) {
        toast.error(
          `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`
        );
        return;
      }
    }

    // Validate phone number format (simple validation)
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(orderDetails.customerPhone.replace(/[^\d]/g, ""))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Prepare order data
    const orderData = {
      branchId: branchDetails.id,
      items: cart.map((item) => ({
        itemId: item.id,
        name: item.nameEnglish,
        quantity: item.quantity,
        price: item.price || 0,
      })),
      totalAmount: parseFloat(getCartTotal()),
      ...orderDetails,
    };

    try {
      setSubmitting(true);
      const response = await createTakeAwayOrder(orderData);

      if (response.success) {
        // Store order token for order success screen
        setOrderSuccess({
          token: response.data.orderToken,
          orderDetails: response.data.orderDetails,
        });

        // Reset form and cart
        setCart([]);
        setOrderDetails({
          customerName: "",
          customerPhone: "",
          notes: "",
        });
        setCheckoutStep(2); // Move to success screen
      } else {
        toast.error(response.message || "Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle checking order status
  const handleCheckStatus = (token) => {
    navigate(`/takeaway/status/${token}`);
  };

  // Render loading state
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Validating QR code...</p>
        </div>
      </div>
    );
  }

  // Render invalid QR code state
  if (!branchDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-50 p-4 rounded-lg text-red-700 text-sm max-w-sm text-center">
          <p className="font-medium mb-2">Invalid QR Code</p>
          <p>Please scan a valid takeaway QR code to place your order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaUtensils className="text-green-600 mr-2" size={18} />
              <div>
                <h1 className="text-lg font-medium text-gray-900">Takeaway</h1>
                <p className="text-xs text-gray-500">{branchDetails.name}</p>
              </div>
            </div>

            {checkoutStep === 0 && (
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                <FaShoppingCart size={16} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {getCartCount()}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4">
        {checkoutStep === 0 ? (
          <>
            {/* Token Search */}
            <TokenSearch />

            {/* Search */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
              <FaSearch
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>

            {/* Filters */}
            <div className="mb-4 flex space-x-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeFilter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("veg")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeFilter === "veg"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Veg
              </button>
              <button
                onClick={() => setActiveFilter("non veg")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeFilter === "non veg"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Non Veg
              </button>
            </div>

            {/* Items */}
            {loading ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">Loading menu...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    currency={currency}
                    onAddToCart={handleAddToCart}
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onViewDetails={handleViewItemDetails}
                  />
                ))}

                {displayedItems.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm">No items found</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : checkoutStep === 1 ? (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-4">Complete Your Order</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name*
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={orderDetails.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Contact Number*
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={orderDetails.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  name="notes"
                  value={orderDetails.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Any special requests or instructions"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-2 text-sm">Order Summary</h3>
              <div className="space-y-1 text-sm mb-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      {item.quantity}x {item.nameEnglish}
                    </span>
                    <span>
                      {((item.price || 0) * item.quantity).toFixed(2)}{" "}
                      {currency}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>
                    {getCartTotal()} {currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex space-x-3">
              <button
                type="button"
                onClick={handleBackToMenu}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Submitting...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUtensils className="text-green-600" size={24} />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your order has been received and is waiting for confirmation.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500 mb-1">Your Order Token</p>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {orderSuccess?.token}
              </div>
              <p className="text-xs text-gray-500">
                Please note down this token number
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              You can use this token to check your order status. Payment will be
              collected at the counter.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleCheckStatus(orderSuccess?.token)}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Check Order Status
              </button>

              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setCheckoutStep(0);
                }}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </main>
      {/* Fixed bottom checkout bar - Shows only when cart has items and on menu screen */}
      {checkoutStep === 0 && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">
                {getCartCount()} {getCartCount() === 1 ? "item" : "items"}
              </div>
              <div className="text-lg font-bold text-green-600">
                {getCartTotal()} {currency}
              </div>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
      // Cart UI improvements for TakeawayMenu.jsx // Replace the cart sidebar
      section with this improved version
      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCart(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-xs sm:max-w-sm">
              <div className="h-full bg-white shadow-xl flex flex-col">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Your Cart
                  </h2>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 p-2"
                    onClick={() => setShowCart(false)}
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <FaShoppingCart size={32} className="mx-auto" />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Your cart is empty
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <li key={item.id} className="py-3 flex">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img
                              src={item.image}
                              alt={item.nameEnglish}
                              className="h-full w-full object-cover object-center"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/64?text=No+Image";
                              }}
                            />
                          </div>

                          <div className="ml-3 flex-1">
                            <div className="flex justify-between text-sm">
                              <h3 className="font-medium text-gray-900">
                                {item.nameEnglish}
                              </h3>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              {(item.price || 0).toFixed(2)} {currency}
                            </p>

                            <div className="mt-2 flex items-center">
                              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                                <button
                                  type="button"
                                  className="text-gray-600 bg-white w-6 h-6 flex items-center justify-center"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                >
                                  <FaMinus size={10} />
                                </button>
                                <span className="px-2 py-1 bg-white text-gray-800 text-xs font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  className="text-gray-600 bg-white w-6 h-6 flex items-center justify-center"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  <FaPlus size={10} />
                                </button>
                              </div>

                              <span className="ml-auto text-sm font-medium text-gray-900">
                                {((item.price || 0) * item.quantity).toFixed(2)}{" "}
                                {currency}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-gray-200 p-4">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-3">
                    <p>Total</p>
                    <p>
                      {getCartTotal()} {currency}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2 px-4 rounded-lg shadow-sm bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={cart.length === 0}
                    onClick={handleProceedToCheckout}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          currency={currency}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
        />
      )}
    </div>
  );
};

export default TakeawayMenu;
