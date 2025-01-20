import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import itemsData from "./DataProvider";
import { FaStar, FaStarHalfAlt, FaShoppingCart } from "react-icons/fa";
import { validateQRAccess } from "../utils/api";

const Items = ({ onAddToCart }) => {
  const { pincode, tableName } = useParams();
  const navigate = useNavigate();
  const [currentCategory, setCurrentCategory] = useState("Chinese");
  const [branchDetails, setBranchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const result = await validateQRAccess(pincode, tableName);
        if (result.success) {
          setBranchDetails(result.branch);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Error fetching branch details:", error);
        setError("Failed to load branch details");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchDetails();
  }, [pincode, tableName]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">{error}</div>
      </div>
    );
  }

  const items = itemsData[currentCategory] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Branch and Table Info */}
      {branchDetails && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{branchDetails.name}</h2>
          <p className="text-gray-600">{branchDetails.address.mainAddress}</p>
          <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Table: {tableName}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-8">
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
          {Object.keys(itemsData).map((category) => (
            <button
              key={category}
              onClick={() => setCurrentCategory(category)}
              className={`px-6 py-2 rounded-full transition-all ${
                currentCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } whitespace-nowrap`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Image Container */}
            <div className="relative h-48">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x200";
                }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <div
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/menu/${pincode}/${tableName}/items/${item.id}`)
                }
              >
                <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Rating */}
              <div className="mt-2 flex items-center">
                <div className="flex space-x-1">{renderStars(item.rating)}</div>
                <span className="ml-2 text-sm text-gray-500">
                  ({item.rating})
                </span>
              </div>

              {/* Price and Add to Cart */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-gray-900">
                    {item.price}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">SAR</span>
                </div>
                <button
                  onClick={() => onAddToCart(item, 1)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaShoppingCart />
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Items Message */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items available in this category</p>
        </div>
      )}
    </div>
  );
};

export default Items;
