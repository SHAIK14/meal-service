import React from "react";
import { FaTimes, FaShoppingCart } from "react-icons/fa";

const Cart = ({ isOpen, onClose, cart, onQuantityChange }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0">
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
                  className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-500">{item.price} SAR</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() =>
                          onQuantityChange(item, Math.max(0, item.quantity - 1))
                        }
                        className="px-2 py-1 bg-gray-100 rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          onQuantityChange(item, item.quantity + 1)
                        }
                        className="px-2 py-1 bg-gray-100 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {(item.price * item.quantity).toFixed(2)} SAR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        <div className="border-t bg-white p-4 sticky bottom-0">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">{total.toFixed(2)} SAR</span>
          </div>
          <button
            onClick={() => alert("Order Placed!")} // Replace with your order logic
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              cart.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Place Order
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;
