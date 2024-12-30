import React from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate for navigation in React Router v6
import itemsData from "./DataProvider"; // Import the items data
import { FaStar, FaStarHalfAlt } from "react-icons/fa"; // Import star icons from react-icons

const Items = ({ category }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Get the items for the selected category
  const items = itemsData[category] || []; // Default to an empty array if itemsData[category] is undefined

  // Handle item click to navigate to the details page
  const handleItemClick = (itemId) => {
    navigate(`/item-details/${itemId}`); // Navigate to the item details page
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating); // Calculate the full stars
    const hasHalfStar = rating % 1 !== 0; // Check if there's a half star

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-500" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }

    // Fill remaining space with empty stars if rating is less than 5
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="flex gap-4 flex-wrap">
      {items.length === 0 ? (
        <p>No items available for this category.</p> // Display a message if there are no items
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 cursor-pointer flex justify-between hover:shadow-lg"
            onClick={() => handleItemClick(item.id)} // Use the correct click handler
          >
            <div className="flex items-center">
              <img
                src={item.img}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg mb-2 sm:mr-4"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/150")
                }
              />
              <div className="flex flex-col ml-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="flex items-center mt-2">
                  <span className="flex space-x-1">
                    {renderStars(item.rating)}
                  </span>
                </div>
              </div>
              <div className="ml-4 justify-center items-center flex flex-col w-20 h-20">
                <h2 className="font-bold text-xl text-red-600">{item.price}</h2>
                <p className="font-semibold">SAR</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Items;
