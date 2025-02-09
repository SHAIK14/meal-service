import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import itemsData from "./DataProvider";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";

const Items = ({ category }) => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleDecreaseQuantity = (itemId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === itemId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout!");
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-500" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }
    return stars;
  };

  const items = itemsData[category] || [];

  return (
    <div className="flex gap-4 flex-wrap">
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 w-60 h-full bg-gray-800 text-white p-4 transform transition-all ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 left-4 text-xl"
        >
          X
        </button>
        <h2 className="text-xl font-semibold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-2"
              >
                <span>{item.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-red-600 px-2 py-1 text-white rounded"
                    onClick={() => handleDecreaseQuantity(item.id)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="bg-green-600 px-2 py-1 text-white rounded"
                    onClick={() => handleAddToCart(item)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleCheckout}
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded"
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Button to toggle sidebar */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-full shadow-lg"
      >
        Cart ({cart.length})
      </button>

      {/* Items */}
      {items.length === 0 ? (
        <p>No items available for this category.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg cursor-pointer flex items-center shadow-lg"
          >
            <div className="flex items-center justify-center">
              <div className="justify-center place-items-center w-28 h-28 items-center flex object-cover">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-4/5 h-4/5 object-cover rounded-lg"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/150")
                  }
                />
              </div>
              <div className="flex flex-col ml-2">
                <h3
                  onClick={() => navigate(`/item-details/${item.id}`)}
                  className="text-lg font-semibold"
                >
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description.split(" ").slice(0, 3).join(" ") +
                    (item.description.split(" ").length > 3 ? "..." : "")}
                </p>
                <div className="flex items-center mt-2">
                  <span className="flex space-x-1">
                    {renderStars(item.rating)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center m-2 p-2">
                <div className="justify-center items-center flex flex-col w-20 h-20">
                  <h2 className="font-bold text-xl text-red-600">
                    {item.price}
                  </h2>
                  <p className="font-semibold">SAR</p>
                  <AddToCartButton onClick={() => onAddToCart(item, 1)} />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Items;
