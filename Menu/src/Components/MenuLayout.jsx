// src/Components/MenuLayout.jsx
import { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaClipboardList,
  FaWifi,
  FaTimes,
} from "react-icons/fa";
import Navbar from "./Navbar";
import Items from "./Items";
import Cart from "./Cart";
import Orders from "./Orders";
import { useDining } from "../contexts/DiningContext";

const MenuLayout = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const { sessionDetails, isConnected } = useDining();

  const handleAddToCart = (item, quantity) => {
    console.log(`Adding to cart: ${item.nameEnglish}, quantity: ${quantity}`);
    setCart((prevCart) => {
      if (quantity === 0) {
        return prevCart.filter((i) => i.id !== item.id);
      }
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) => (i.id === item.id ? { ...i, quantity } : i));
      }
      return [...prevCart, { ...item, quantity }];
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const toggleView = () => {
    setShowOrders(!showOrders);
    if (isCartOpen) {
      setIsCartOpen(false);
    }
  };

  // Show connection status
  useEffect(() => {
    console.log("Socket connection status in MenuLayout:", isConnected);
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Connection Status Indicator */}
      <div
        className={`text-xs flex items-center justify-end px-4 py-1 ${
          isConnected ? "text-green-500" : "text-red-500"
        }`}
      >
        {isConnected ? (
          <>
            <FaWifi className="mr-1" /> Connected
          </>
        ) : (
          <>
            <FaTimes className="mr-1" /> Disconnected
          </>
        )}
      </div>

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* View Toggle Button */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {showOrders ? "Your Orders" : activeCategory}
          </h1>
          <button
            onClick={toggleView}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50"
          >
            {showOrders ? (
              <>
                <span>View Menu</span>
              </>
            ) : (
              <>
                <FaClipboardList className="mr-2" />
                <span>View Orders</span>
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className={showOrders ? "hidden" : "block"}>
          <Items
            activeCategory={activeCategory}
            onAddToCart={handleAddToCart}
          />
        </div>
        <div className={!showOrders ? "hidden" : "block"}>
          <Orders />
        </div>
      </main>

      {/* Cart Button */}
      {!showOrders && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors z-40"
        >
          <div className="relative">
            <FaShoppingCart size={24} />
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {totalItems}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Session Total Display */}
      {sessionDetails?.totalAmount > 0 && (
        <div className="fixed bottom-6 left-6 bg-white px-4 py-2 rounded-lg shadow-lg z-40">
          <span className="text-sm text-gray-600">Session Total:</span>
          <span className="ml-2 font-bold text-red-500">
            {sessionDetails.totalAmount.toFixed(2)} SAR
          </span>
        </div>
      )}

      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        cart={cart}
        onQuantityChange={handleAddToCart}
      />
    </div>
  );
};

export default MenuLayout;
