// src/components/Cart.jsx
import { useState, useEffect } from "react";
import {
  FaTimes,
  FaShoppingCart,
  FaEdit,
  FaSave,
  FaFire,
  FaCog,
} from "react-icons/fa";
import { useDining } from "../contexts/DiningContext";
import { createDiningOrder } from "../utils/api";
import SpiceLevelSelector from "./SpiceLevelSelector";

const Cart = ({
  isOpen,
  onClose,
  cart,
  onQuantityChange,
  onClearCart,
  onOrderSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editSpiceLevel, setEditSpiceLevel] = useState(0);
  const [editNotes, setEditNotes] = useState("");

  const {
    branchDetails,
    sessionDetails,
    getUserLocation,
    updateSessionDetails,
    updateOrders,
    socket,
    isConnected,
  } = useDining();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Listen for socket confirmation of new order
  useEffect(() => {
    if (socket) {
      const handleNewOrderConfirmation = (data) => {
        console.log("New order confirmation received:", data);
      };

      socket.on("new_order_confirmed", handleNewOrderConfirmation);

      return () => {
        socket.off("new_order_confirmed", handleNewOrderConfirmation);
      };
    }
  }, [socket]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startEditingItem = (item) => {
    setEditingItem(item.id);
    setEditSpiceLevel(item.spiceLevel || 0);
    setEditNotes(item.dietaryNotes || "");
  };

  const saveItemChanges = (item) => {
    // Update the item with edited values
    const updatedItem = {
      ...item,
      spiceLevel: editSpiceLevel,
      dietaryNotes: editNotes,
    };

    // Update the cart with the modified item
    onQuantityChange(updatedItem, item.quantity, editSpiceLevel, editNotes);

    // Exit edit mode
    setEditingItem(null);
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const handleOrder = async () => {
    try {
      console.log("Placing order...");
      setIsLoading(true);
      setError(null);

      const location = await getUserLocation();
      console.log("Got user location:", location);

      // Calculate distance
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        branchDetails.address.coordinates.latitude,
        branchDetails.address.coordinates.longitude
      );

      console.log(
        `Distance to restaurant: ${distance}km, Allowed radius: ${branchDetails.diningRadius}km`
      );

      // Check if user is within dining radius
      if (distance > branchDetails.diningRadius) {
        throw new Error("You need to be at the restaurant to place an order");
      }

      const orderData = {
        sessionId: sessionDetails?.id,
        branchId: branchDetails.id,
        tableName: branchDetails.tableName,
        items: cart.map((item) => ({
          itemId: item.id,
          name: item.nameEnglish,
          quantity: item.quantity,
          price: item.price,
          spiceLevel: item.spiceLevel || 0,
          dietaryNotes: item.dietaryNotes || "",
        })),
        totalAmount: total,
        userLocation: location,
      };

      console.log("Sending order data:", orderData);

      // Send order to server
      const response = await createDiningOrder(orderData);

      if (response.success) {
        console.log("Order created successfully:", response.data);
        const newOrder = response.data.order;

        // Update session details with new total
        updateSessionDetails({
          id: sessionDetails?.id,
          totalAmount: response.data.sessionTotal || 0,
          paymentRequested: sessionDetails?.paymentRequested || false,
        });

        // Get existing orders and add the new one at the beginning
        const existingOrders = sessionDetails?.orders || [];

        // Simple approach: Just add the new order to the beginning of the existing orders
        updateOrders([newOrder, ...existingOrders]);

        alert("Order placed successfully!");

        // Clear the cart after successful order
        onClearCart();

        // Notify parent component about successful order
        if (onOrderSuccess) {
          onOrderSuccess();
        }

        onClose(); // Close the cart modal
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Order Error Details:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpiceLevel = (level) => {
    if (!level || level === 0) return null;

    return (
      <div className="flex items-center">
        {[...Array(level)].map((_, i) => (
          <FaFire key={i} className="text-red-500 text-xs" />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white z-50">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <FaShoppingCart className="text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* Connection Status (for debugging) */}
        <div
          className={`px-4 py-2 text-sm ${
            isConnected ? "text-green-500" : "text-red-500"
          }`}
        >
          {isConnected ? "Connected to server" : "Not connected to server"}
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto h-[calc(100vh-180px)] p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.nameEnglish}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.nameEnglish}</h3>
                      <p className="text-gray-500">{item.price} SAR</p>

                      <div className="flex items-center mt-2 space-x-2">
                        <button
                          onClick={() =>
                            onQuantityChange(
                              item,
                              Math.max(0, item.quantity - 1),
                              item.spiceLevel,
                              item.dietaryNotes
                            )
                          }
                          className="px-2 py-1 bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            onQuantityChange(
                              item,
                              item.quantity + 1,
                              item.spiceLevel,
                              item.dietaryNotes
                            )
                          }
                          className="px-2 py-1 bg-gray-100 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item customization summary or edit button */}
                  <div className="mt-3 border-t pt-2">
                    {editingItem !== item.id ? (
                      <div className="flex justify-between items-center">
                        <div>
                          {item.spiceLevel > 0 || item.dietaryNotes ? (
                            <div className="flex flex-col">
                              {item.spiceLevel > 0 && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-600 mr-2">
                                    Spice:
                                  </span>
                                  {renderSpiceLevel(item.spiceLevel)}
                                </div>
                              )}

                              {item.dietaryNotes && (
                                <div className="mt-1">
                                  <span className="text-xs text-gray-600">
                                    Notes:
                                  </span>
                                  <p className="text-xs text-gray-700 italic">
                                    "{item.dietaryNotes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Default preparation
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => startEditingItem(item)}
                          className="flex items-center text-sm text-blue-500 hover:text-blue-600 bg-blue-50 px-2 py-1 rounded"
                        >
                          <FaCog className="mr-1" />
                          Customize
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Customize Your Order (Optional)
                        </h4>

                        <SpiceLevelSelector
                          value={editSpiceLevel}
                          onChange={setEditSpiceLevel}
                        />

                        <div className="mt-3">
                          <label className="block text-sm text-gray-700 mb-1">
                            Dietary Notes (Optional):
                          </label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Allergies or special requests..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            rows="2"
                          ></textarea>
                        </div>

                        <div className="flex mt-3 space-x-2">
                          <button
                            onClick={() => saveItemChanges(item)}
                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center"
                          >
                            <FaSave className="mr-1" /> Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-white p-4 sticky bottom-0">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-between mb-4">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">{total.toFixed(2)} SAR</span>
          </div>

          <button
            onClick={handleOrder}
            disabled={cart.length === 0 || isLoading || editingItem !== null}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              cart.length === 0 || isLoading || editingItem !== null
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isLoading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;
