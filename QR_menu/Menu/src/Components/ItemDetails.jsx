import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import itemsData from "./DataProvider";
import "tailwindcss/tailwind.css";
import { FaFire, FaWeight, FaCarrot, FaAppleAlt } from "react-icons/fa";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const ItemDetails = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const item = Object.values(itemsData)
      .flat()
      .find((item) => item.id === parseInt(itemId));
    setItem(item);
  }, [itemId]);

  const handleClose = () => {
    navigate(-1);
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

  if (!item) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white  max-w-xl w-full rounded-3xl shadow-lg relative overflow-hidden">
        {/* Close Button on Image */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-xl text-center bg-slate-300 w-8 h-8 flex justify-center font-bold rounded-3xl text-black transition-all duration-300 hover:text-white hover:bg-black"
        >
          &times;
        </button>

        {/* Item Image */}
        <div className="flex justify-center rounded-3xl overflow-hidden">
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-[200px] object-cover rounded-t-3xl"
            onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
          />
        </div>
        <div className="px-8 pb-10">
          {/* Item Name */}
          <div className=" flex items-center justify-between">
            <h2 className="text-3xl  font-bold text-left text-gray-800 mt-4 ">
              {item.name}
            </h2>
            <div className="flex items-baseline mt-2  ">
              <h2 className="text-l font-bold text-white mt-2 bg-red-600 px-4 py-2 rounded-full">
                {" "}
                {item.price}{" "}
                <span className="text-white font-semibold">SAR</span>
              </h2>
            </div>
          </div>
          {/* Item Description */}
          <p className="text-lg text-left text-gray-600 mt-2">
            {item.description}
          </p>

          {/* Item Rating */}
          <div className="flex items-center space-x-2 mt-4">
            <span className="flex space-x-1">
              {renderStars(item.rating)} {/* Render star icons */}
            </span>
            <span className="text-lg font-semibold text-gray-800">
              {item.rating}
            </span>
          </div>

          {/* Nutritional Facts */}
          <div className="space-y-2 mt-6 text-left">
            <h3 className="text-xl mb-6 font-semibold text-gray-800">
              Nutritional Facts
            </h3>
            <div className="flex flex-wrap justify-between gap-4  text-gray-600 sm:flex-nowrap">
              <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col sm:space-x-2 sm:text-sm">
                <FaCarrot className="text-yellow-500  sm:mb-0 sm:text-2xl" />
                <div>
                  <p className="font-bold">Protein</p>
                  <p className="text-xs sm:text-sm">
                    {item.nutritionFacts.protein}g
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row gap-4 sm:space-x-2 lg:flex-col sm:text-sm">
                <FaFire className="text-yellow-500 mb-8 sm:mb-0  sm:text-2xl " />
                <div>
                  <p className="font-bold">Calories</p>
                  <p className="text-xs sm:text-sm">
                    {item.nutritionFacts.calories}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:space-x-2 gap-4  lg:flex-col sm:text-sm">
                <FaWeight className="text-yellow-500 mb-2 sm:mb-0 sm:text-2xl" />
                <div>
                  <p className="font-bold">Fat</p>
                  <p className="text-xs sm:text-sm">
                    {item.nutritionFacts.fat}g
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:space-x-2 gap-4 lg:flex-col sm:text-sm">
                <FaAppleAlt className="text-yellow-500 mb-2 sm:mb-0 sm:text-2xl" />
                <div>
                  <p className="font-bold">Carbs</p>
                  <p className="text-xs sm:text-sm">
                    {item.nutritionFacts.carbs}g
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
