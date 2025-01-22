import React, { useState, useEffect } from "react";
import { getDiningMenuItems } from "../utils/api";
import { useDining } from "../contexts/DiningContext";

const Items = ({ activeCategory, onAddToCart }) => {
  const [categoryItems, setCategoryItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const { branchDetails } = useDining();

  useEffect(() => {
    const fetchItems = async () => {
      if (branchDetails?.id && activeCategory) {
        const response = await getDiningMenuItems(branchDetails.id);
        if (response.success) {
          const category = response.data.find(
            (cat) => cat.name === activeCategory
          );
          setCategoryItems(category?.items || []);
        }
      }
    };

    fetchItems();
  }, [branchDetails, activeCategory]);

  const handleQuantityChange = (itemId, newQuantity) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));

    const item = categoryItems.find((i) => i.id === itemId);
    if (item) {
      onAddToCart(item, newQuantity);
    }
  };

  const AddToCartButton = ({ item }) => {
    const quantity = quantities[item.id] || 0;

    return (
      <div className="mt-2">
        {quantity === 0 ? (
          <button
            onClick={() => handleQuantityChange(item.id, 1)}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.id, quantity - 1)}
              className="px-4 py-2 text-red-500 hover:bg-gray-200 rounded-l-lg"
            >
              -
            </button>
            <span className="px-4 font-medium">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.id, quantity + 1)}
              className="px-4 py-2 text-red-500 hover:bg-gray-200 rounded-r-lg"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoryItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative h-48">
            <img
              src={item.image}
              alt={item.nameEnglish}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x200";
              }}
            />
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {item.nameEnglish}
            </h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {item.descriptionEnglish}
            </p>

            <div className="mt-4">
              <div className="flex items-baseline mb-2">
                <span className="text-xl font-bold text-gray-900">
                  {item.price}
                </span>
                <span className="ml-1 text-sm text-gray-500">SAR</span>
              </div>
              <AddToCartButton item={item} />
            </div>
          </div>
        </div>
      ))}

      {categoryItems.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No items available in this category</p>
        </div>
      )}
    </div>
  );
};

export default Items;
