/* eslint-disable react/prop-types */
// src/components/Items.jsx
import { useState, useEffect } from "react";
import { getDiningMenuItems, getMenuItemDetails } from "../utils/api";
import { useDining } from "../contexts/DiningContext";
import { SaudiRiyal } from "lucide-react";

import { FaFire } from "react-icons/fa";

const Items = ({ activeCategory, onAddToCart, orderPlaced = 0 }) => {
  const [categoryItems, setCategoryItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const { branchDetails } = useDining();
  const [detailedItems, setDetailedItems] = useState([]); // Store combined items with details
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchItems = async () => {
      if (branchDetails?.id && activeCategory) {
        const response = await getDiningMenuItems(branchDetails.id);

        if (response.success && isMounted) {
          const category = response.data.find(
            (cat) => cat.name === activeCategory
          );

          if (category) {
            setCategoryItems(category.items);
          } else {
            // Handle no category found
          }
        } else {
          // Handle error
        }
      }
    };

    fetchItems();
    return () => {
      isMounted = false;
    };
  }, [branchDetails?.id, activeCategory]);

  // Fetch detailed information for each item
  useEffect(() => {
    let isMounted = true;

    const fetchItemDetails = async () => {
      if (categoryItems.length > 0) {
        setLoading(true);
        try {
          const itemDetailsPromises = categoryItems.map((item) =>
            getMenuItemDetails(branchDetails.id, item.id)
          );

          const detailsResults = await Promise.all(itemDetailsPromises);
          console.log("Details Results:", detailsResults);

          if (isMounted) {
            const combinedItems = categoryItems.map((item, index) => {
              const details = detailsResults[index]?.success
                ? detailsResults[index].data
                : {};

              return {
                ...item,
                ...details,
                calories: details?.nutritionFacts?.calories || "N/A",
                descriptionEnglish:
                  details?.descriptionEnglish || "No description available",
              };
            });

            setDetailedItems(combinedItems); // Update detailedItems state
          }
        } catch (error) {
          console.error("Error fetching item details:", error);
        }
        setLoading(false);
      }
    };

    fetchItemDetails();
    return () => {
      isMounted = false;
    };
  }, [categoryItems]);

  // Reset quantities when an order is successfully placed
  useEffect(() => {
    if (orderPlaced > 0) {
      console.log("Order was placed, resetting all item quantities");
      setQuantities({});
    }
  }, [orderPlaced]);

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
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 active:bg-white active:text-black transition-colors"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.id, quantity - 1)}
              className="px-4 py-2 text-red-700 font-bold text-xl flex items-center justify-center bg-gray-200 hover:bg-gray-200 rounded-l-lg"
            >
              -
            </button>
            <span className="px-4 font-medium">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.id, quantity + 1)}
              className="px-4 py-2 text-green-700 font-bold text-xl flex items-center justify-center bg-gray-200 hover:bg-gray-200 rounded-r-lg"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 p-4 rounded-xl bg-white md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Use detailedItems instead of categoryItems for rendering */}
      {detailedItems.map((item) => (
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
            {item.calories && item.calories !== "N/A" && (
              <div className="absolute left-4 top-4 w-fit  font-bold right-2 flex items-center gap-1 bg-white bg-opacity-75 px-2 py-1 rounded-md text-sm">
                {item.calories}{" "}
                <span className="text-orange-500">
                  <FaFire />
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {item.nameEnglish}
              </h3>
              <div className="flex items-center mb-2">
                <span className="ml-1 text-sm text-black">
                  {" "}
                  <SaudiRiyal />
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {item.price.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {item.descriptionEnglish}
            </p>

            <div className="mt-4">
              <AddToCartButton item={item} />
            </div>
          </div>
        </div>
      ))}

      {detailedItems.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No items available in this category</p>
        </div>
      )}
    </div>
  );
};

export default Items;
