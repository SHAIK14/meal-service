/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  validateCateringAccess,
  getCateringMenuItems,
  getItemDetails,
  createCateringOrder,
} from "../utils/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaTimes,
  FaUtensils,
} from "react-icons/fa";
import toast from "react-hot-toast";

// Item Card Component
const ItemCard = ({
  item,
  currency,
  onAddToCart,
  cart,
  onUpdateQuantity,
  onViewDetails,
}) => {
  const quantity =
    cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0;

  // Debug item data
  console.log("ItemCard rendering with item:", item);

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden flex flex-col h-full">
      <div className="relative h-32">
        <img
          src={item.image}
          alt={item.nameEnglish}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=No+Image";
          }}
        />
        <div
          className={`absolute top-0 right-0 px-2 py-1 text-xs font-medium ${
            item.type === "Veg"
              ? "bg-green-500 text-white"
              : "bg-orange-500 text-white"
          }`}
        >
          {item.type}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
          {item.nameEnglish}
        </h3>

        <div className="mt-auto">
          <div className="text-sm font-semibold text-gray-900">
            {(item.price || 0).toFixed(2)} {currency}
          </div>

          <div className="mt-2">
            {quantity === 0 ? (
              <button
                onClick={() => onAddToCart(item)}
                className="w-full bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            ) : (
              <div className="flex items-center justify-between bg-gray-100 rounded">
                <button
                  onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded-l"
                >
                  <FaMinus size={12} />
                </button>
                <span className="px-2 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded-r"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View details button (simpler design) */}
      <button
        onClick={() => onViewDetails(item)}
        className="w-full py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 border-t"
      >
        View Details
      </button>
    </div>
  );
};

// Item Details Modal
const ItemDetailsModal = ({
  item,
  currency,
  onClose,
  onAddToCart,
  cart,
  onUpdateQuantity,
}) => {
  const quantity =
    cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-gray-200 text-gray-600"
          onClick={onClose}
        >
          <FaTimes size={16} />
        </button>

        <div className="relative h-48">
          <img
            src={item.image}
            alt={item.nameEnglish}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300?text=No+Image";
            }}
          />
          <div
            className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium ${
              item.type === "Veg"
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {item.type}
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {item.nameEnglish}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {item.descriptionEnglish || "No description available"}
          </p>

          <div className="mt-4">
            <div className="text-lg font-bold text-gray-900">
              {(item.price || 0).toFixed(2)} {currency}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">Calories:</span>
                <span className="float-right font-medium">
                  {item.nutritionFacts?.calories || 0}
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">Protein:</span>
                <span className="float-right font-medium">
                  {item.nutritionFacts?.protein || 0}g
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">Carbs:</span>
                <span className="float-right font-medium">
                  {item.nutritionFacts?.carbs || 0}g
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">Fat:</span>
                <span className="float-right font-medium">
                  {item.nutritionFacts?.fat || 0}g
                </span>
              </div>
            </div>

            <div className="mt-5">
              {quantity === 0 ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="px-4 py-2 text-gray-800 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <span className="font-medium text-gray-800">
                    {((item.price || 0) * quantity).toFixed(2)} {currency}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CateringMenu = () => {
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
    cateringType: "indoor",
    numberOfPeople: 10,
    referralSource: "self",
    staffName: "",
    customerName: "",
    customerContact: "",
    notes: "",
    eventDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    eventTime: "12:00",
  });
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Menu, 1: Form
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState("SAR");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const validate = async () => {
      try {
        setValidating(true);
        const response = await validateCateringAccess(pincode);

        console.log("Validation response:", response);

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
      const response = await getCateringMenuItems(branchId);

      console.log("Menu items response:", response);

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

        console.log("Processed items:", items);

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
        console.log("Item details response:", response);

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

  const handleDateChange = (date) => {
    setOrderDetails((prev) => ({ ...prev, eventDate: date }));
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setCheckoutStep(1);
  };

  const handleBackToMenu = () => {
    setCheckoutStep(0);
  };

  const handleSubmitOrder = async () => {
    // Validate form
    const requiredFields = ["customerName", "customerContact"];

    if (orderDetails.referralSource === "staff" && !orderDetails.staffName) {
      toast.error("Staff name is required when referral source is staff");
      return;
    }

    for (const field of requiredFields) {
      if (!orderDetails[field]) {
        toast.error(
          `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`
        );
        return;
      }
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

    console.log("Submitting order data:", orderData);

    try {
      setSubmitting(true);
      const response = await createCateringOrder(orderData);

      console.log("Order submission response:", response);

      if (response.success) {
        toast.success("Order submitted successfully!");
        // Reset form and cart
        setCart([]);
        setOrderDetails({
          cateringType: "indoor",
          numberOfPeople: 10,
          referralSource: "self",
          staffName: "",
          customerName: "",
          customerContact: "",
          notes: "",
          eventDate: new Date(new Date().setDate(new Date().getDate() + 1)),
          eventTime: "12:00",
        });
        setCheckoutStep(0);
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

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Validating...</p>
        </div>
      </div>
    );
  }

  if (!branchDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-4 rounded-lg text-red-700 text-sm">
          Invalid QR code. Please scan a valid QR code.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaUtensils className="text-green-600 mr-2" size={18} />
              <div>
                <h1 className="text-lg font-medium text-gray-900">Catering</h1>
                <p className="text-xs text-gray-500">{branchDetails.name}</p>
              </div>
            </div>

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
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 pb-20">
        {checkoutStep === 0 ? (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filters */}
            <div className="mb-4 flex space-x-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  activeFilter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("veg")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  activeFilter === "veg"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Veg
              </button>
              <button
                onClick={() => setActiveFilter("non veg")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
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
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">Loading items...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
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
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500 text-sm">No items found</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Complete Your Order</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catering Type
                </label>
                <select
                  name="cateringType"
                  value={orderDetails.cateringType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="indoor">Indoor Catering</option>
                  <option value="outdoor">Outdoor Catering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of People
                </label>
                <input
                  type="number"
                  name="numberOfPeople"
                  value={orderDetails.numberOfPeople}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date
                  </label>
                  <DatePicker
                    selected={orderDetails.eventDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Time
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={orderDetails.eventTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referred By
                </label>
                <select
                  name="referralSource"
                  value={orderDetails.referralSource}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="self">Self</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {orderDetails.referralSource === "staff" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Name
                  </label>
                  <input
                    type="text"
                    name="staffName"
                    value={orderDetails.staffName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter staff name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name*
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={orderDetails.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  name="customerContact"
                  value={orderDetails.customerContact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your contact number"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Submitting...
                  </span>
                ) : (
                  "Submit Order"
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sliding Cart Panel */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCart(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-sm">
              <div className="h-full bg-white shadow-xl flex flex-col">
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Your Cart
                    </h2>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowCart(false)}
                    >
                      <span className="sr-only">Close panel</span>
                      <FaTimes size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <FaShoppingCart size={32} />
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
                              <button
                                type="button"
                                className="text-gray-600 border border-gray-300 rounded-l p-1"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <FaMinus size={10} />
                              </button>
                              <span className="px-2 py-1 border-t border-b border-gray-300 bg-white text-xs">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="text-gray-600 border border-gray-300 rounded-r p-1"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <FaPlus size={10} />
                              </button>

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
                    className="w-full py-2 px-4 rounded-md shadow-sm bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={cart.length === 0}
                    onClick={() => {
                      setShowCart(false);
                      if (cart.length > 0) {
                        handleProceedToCheckout();
                      }
                    }}
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

export default CateringMenu;
