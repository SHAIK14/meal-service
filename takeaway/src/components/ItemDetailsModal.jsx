// src/components/ItemDetailsModal.jsx
import React from "react";
import { FaPlus, FaMinus, FaTimes } from "react-icons/fa";

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

  // Make sure we have access to nutritional info regardless of data structure
  const nutrition = {
    calories: item.nutritionFacts?.calories || item.calories || 0,
    protein: item.nutritionFacts?.protein || item.protein || 0,
    carbs: item.nutritionFacts?.carbs || item.carbs || 0,
    fat: item.nutritionFacts?.fat || item.fat || 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white bg-opacity-80 text-gray-700 hover:bg-gray-200"
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
            className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium ${
              item.type === "Veg"
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white"
            } rounded-md`}
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
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600">Calories</span>
                <span className="float-right font-medium text-gray-900">
                  {nutrition.calories}
                </span>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600">Protein</span>
                <span className="float-right font-medium text-gray-900">
                  {nutrition.protein}g
                </span>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600">Carbs</span>
                <span className="float-right font-medium text-gray-900">
                  {nutrition.carbs}g
                </span>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600">Fat</span>
                <span className="float-right font-medium text-gray-900">
                  {nutrition.fat}g
                </span>
              </div>
            </div>

            <div className="mt-5">
              {quantity === 0 ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                      className="px-4 py-2 bg-white text-gray-600 hover:bg-gray-100"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="px-4 py-2 text-gray-800 font-medium bg-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                      className="px-4 py-2 bg-white text-gray-600 hover:bg-gray-100"
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

export default ItemDetailsModal;
