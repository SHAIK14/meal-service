// src/components/ItemCard.jsx
import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

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

  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-row h-24 mb-3 cursor-pointer"
      onClick={() => onViewDetails(item)}
    >
      {/* Image container */}
      <div className="relative w-24 h-24 flex-shrink-0">
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

      {/* Content container */}
      <div className="flex-1 p-2 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
            {item.nameEnglish}
          </h3>
          <div className="text-xs text-gray-500 line-clamp-1">
            {item.calories} Cal • {item.protein}g Protein • {item.carbs}g Carbs
          </div>
        </div>

        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-sm font-semibold text-gray-900">
            {(item.price || 0).toFixed(2)} {currency}
          </div>

          {quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-green-700"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center border border-gray-300 rounded-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(item.id, quantity - 1);
                }}
                className="w-6 h-6 flex items-center justify-center text-white-600 rounded-l-full bg-white"
              >
                <FaMinus size={10} />
              </button>
              <span className="px-2 text-xs font-medium bg-white text-gray-800">
                {quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(item.id, quantity + 1);
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-600 rounded-r-full bg-white"
              >
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
