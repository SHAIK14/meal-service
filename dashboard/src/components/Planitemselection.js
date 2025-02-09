import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/PlanItemSelection.css";
import {
  getPlanById,
  getAllItems,
  updateWeekMenu,
  getWeekMenu,
} from "../utils/api";

// Move days outside component to avoid recreation
const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DEFAULT_CURRENCY = "SAR";

const PlanItemSelection = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDay, setSelectedDay] = useState(WEEK_DAYS[0]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [weekMenu, setWeekMenu] = useState({});
  const [availableMeals, setAvailableMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packagePrices, setPackagePrices] = useState({});
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  const fetchPlanDetails = useCallback(async () => {
    if (!planId) return;

    try {
      const result = await getPlanById(planId);
      if (result.success) {
        setPlan(result.data.plan);
        setSelectedPackage(result.data.plan.package[0]);
        setCurrency(result.data.plan.currency || DEFAULT_CURRENCY);

        // Initialize weekMenu with all days
        const initialWeekMenu = {};
        WEEK_DAYS.forEach((day) => {
          initialWeekMenu[day] = {};
          result.data.plan.package.forEach((pkg) => {
            initialWeekMenu[day][pkg] = [];
          });
        });
        setWeekMenu(initialWeekMenu);

        // Initialize package prices
        const initialPrices = {};
        result.data.plan.package.forEach((pkg) => {
          initialPrices[pkg] = 0;
        });
        setPackagePrices(initialPrices);
      } else {
        setError(result.error || "Failed to fetch plan details");
      }
    } catch (error) {
      setError("An error occurred while fetching plan details");
    }
  }, [planId]);

  const fetchWeekMenu = useCallback(async () => {
    if (!planId) return;

    try {
      const result = await getWeekMenu(planId);
      if (result.success) {
        setWeekMenu(result.data.weekMenu || {});
        if (result.data.packagePricing) {
          setPackagePrices(result.data.packagePricing);
        }
        if (result.data.currency) {
          setCurrency(result.data.currency);
        }
      } else {
        setError(result.error || "Failed to fetch week menu");
      }
    } catch (error) {
      setError("An error occurred while fetching week menu");
    }
  }, [planId]);

  const fetchAvailableMeals = useCallback(async () => {
    try {
      const result = await getAllItems();
      if (result.success) {
        const filteredMeals = result.items.filter(
          (meal) => meal.services && meal.services[plan?.service]
        );
        setAvailableMeals(filteredMeals);
      } else {
        setError(result.error || "Failed to fetch available meals");
      }
    } catch (error) {
      setError("An error occurred while fetching available meals");
    }
  }, [plan?.service]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchPlanDetails();
        await fetchWeekMenu();
      } catch (error) {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchPlanDetails, fetchWeekMenu]);

  useEffect(() => {
    if (plan?.service) {
      fetchAvailableMeals();
    }
  }, [plan?.service, fetchAvailableMeals]);

  // Handle when drag starts
  const handleDragStart = (event, meal) => {
    // Set dragging state to true
    setIsDragging(true);
    // Store the dragged item in the dataTransfer object
    event.dataTransfer.setData("meal", JSON.stringify(meal));
  };

  // Handle when the drag ends (whether or not it was dropped)
  const handleDragEnd = () => {
    setIsDragging(false); // Hide the overlay when drag ends
  };

  // Handle when an item is dropped
  const handleDrop = (event) => {
    event.preventDefault(); // Prevent the default behavior
    const meal = JSON.parse(event.dataTransfer.getData("meal")); // Retrieve the dragged meal
    handleAddMeal(meal); // Add the meal to the selected list
    setIsDragging(false); // Hide the overlay after drop
  };

  const handleAddMeal = (meal) => {
    const dayMenu = weekMenu[selectedDay]?.[selectedPackage] || [];
    const isMealSelected = dayMenu.some(
      (selectedMeal) => selectedMeal._id === meal._id
    );

    if (isMealSelected) {
      alert(
        "This meal has already been selected for the current package and day."
      );
      return;
    }

    setWeekMenu((prevWeekMenu) => ({
      ...prevWeekMenu,
      [selectedDay]: {
        ...prevWeekMenu[selectedDay],
        [selectedPackage]: [...dayMenu, meal],
      },
    }));
  };

  const handleRemoveMeal = (mealId) => {
    setWeekMenu((prevWeekMenu) => ({
      ...prevWeekMenu,
      [selectedDay]: {
        ...prevWeekMenu[selectedDay],
        [selectedPackage]: (
          prevWeekMenu[selectedDay]?.[selectedPackage] || []
        ).filter((meal) => meal._id !== mealId),
      },
    }));
  };

  const handlePriceChange = (pkg, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setPackagePrices((prev) => ({
      ...prev,
      [pkg]: numValue,
    }));
  };

  const handleSavePlan = async () => {
    if (!planId) {
      setError("Invalid plan ID");
      return;
    }

    const missingPrices = Object.entries(packagePrices)
      .filter(([_, price]) => !price || price === 0)
      .map(([pkg]) => pkg);

    if (missingPrices.length > 0) {
      alert(
        `Please set prices for the following packages: ${missingPrices.join(
          ", "
        )}`
      );
      return;
    }

    try {
      const updateData = {
        weekMenu,
        packagePricing: packagePrices,
        currency,
      };

      const result = await updateWeekMenu(planId, updateData);

      if (result.success) {
        alert("Plan items and prices saved successfully");
        navigate("/plans");
      } else {
        setError(result.error || "Failed to save plan items");
      }
    } catch (error) {
      setError("An error occurred while saving plan items");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-700">Just a Moment</div>
      </div>
    );
  if (error) return <div className="error">{error}</div>;
  if (!plan) return <div className="error">Plan not found</div>;

  return (
    <div className="p-8">
      <div className="flex items-center  gap-4 mb-10">
        <h1 className="bg-white m-0 p-0 text-left text-2xl font-bold text-black">
          Select Items for {plan.nameEnglish}
        </h1>

        <span className="font-semibold">Service Type:</span>
        <span className="text-blue-500">
          {plan.service.charAt(0).toUpperCase() +
            plan.service.slice(1).replace(/([A-Z])/g, " $1")}
        </span>
      </div>

      <div className="bg-red-500 flex rounded-md justify-evenly items-center p-4">
        {WEEK_DAYS.map((day) => (
          <button
            key={day}
            className={`text-white px-4 py-2 transition-all duration-200 ${
              selectedDay === day
                ? "font-bold decoration-white "
                : "font-normal"
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex justify-evenly items-center w-full mb-5 p-4 gap-4">
        {plan.package.map((pkg) => (
          <button
            key={pkg}
            className={`relative text-lg px-5 py-2 rounded-full transition-all duration-200 ${
              selectedPackage === pkg
                ? "text-red-500 font-bold after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[-5px] after:h-[3px] after:bg-red-500"
                : "text-gray-600"
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        {/* Available Meals Section */}
        <div className="relative flex flex-col w-1/2 p-4">
          <h2 className="text-2xl font-semibold mb-2">Available Meals</h2>
          <div className="grid grid-cols-3  bg-white  rounded-lg border h-[600px] overflow-auto p-4  ">
            {availableMeals.length > 0 ? (
              availableMeals.map((meal) => (
                <div
                  key={meal._id}
                  className="meal-card"
                  draggable
                  onDragStart={(event) => handleDragStart(event, meal)} // Start drag
                  onDragEnd={handleDragEnd} // End drag
                  onClick={() => handleAddMeal(meal)}
                >
                  <div className="meal-image-container">
                    <img
                      src={meal.image}
                      alt={meal.nameEnglish}
                      className="meal-image"
                    />
                  </div>
                  <h3 className="text-sm mt-2 font-semibold">
                    {meal.nameEnglish}
                  </h3>
                </div>
              ))
            ) : (
              <p>No meals available for {plan.service} service.</p>
            )}
          </div>
        </div>

        {/* Selected Meals Section with Overlay */}
        <div
          className="relative flex flex-col w-1/2 p-4"
          onDragOver={(e) => e.preventDefault()} // Allow drop
          onDrop={handleDrop} // Handle drop
        >
          <h2 className="text-2xl font-semibold mb-2">
            Selected Meals for{" "}
            {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} -{" "}
            {selectedPackage?.charAt(0).toUpperCase() +
              selectedPackage?.slice(1)}
          </h2>

          {/* Overlay: Visible only when dragging */}
          {isDragging && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold rounded-lg z-10">
              Drop it like it's hot 🔥
            </div>
          )}

          {/* Selected Meals Container */}
          <div className="grid grid-cols-3  bg-white  rounded-lg border h-[600px] overflow-auto p-4 ">
            {weekMenu[selectedDay]?.[selectedPackage]?.length > 0 ? (
              weekMenu[selectedDay][selectedPackage].map((meal) => (
                <div key={meal._id} className="selected-meal-card">
                  <div className="meal-image-container relative">
                    <img
                      src={meal.image}
                      alt={meal.nameEnglish}
                      className="meal-image"
                    />
                    <button
                      className="remove-button absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      onClick={() => handleRemoveMeal(meal._id)}
                    >
                      <span className="remove-icon">-</span>
                    </button>
                  </div>
                  <h3 className="text-sm mt-2 font-semibold">
                    {meal.nameEnglish}
                  </h3>
                </div>
              ))
            ) : (
              <p>
                No meals selected for this package and day. Drag or select the
                meal.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="  bg-gray-100 p-4 rounded-xl ">
        <h2 className="text-black text-xl font-semibold mb-4">
          Package Prices (Per Day)
        </h2>

        <div className="package-prices grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.package.map((pkg) => (
            <div
              key={pkg}
              className="package-price-input bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <label className="flex items-center space-x-3 text-lg text-gray-700">
                <i className="fas fa-box-open text-2xl text-yellow-400"></i>
                <span>{pkg.charAt(0).toUpperCase() + pkg.slice(1)}:</span>
              </label>

              <div className="price-input-wrapper flex items-center mt-2 space-x-2">
                <input
                  type="number"
                  value={packagePrices[pkg] || ""}
                  onChange={(e) => handlePriceChange(pkg, e.target.value)}
                  placeholder="Enter price per day"
                  min="0"
                  required
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <span className="currency text-lg font-semibold">
                  {currency}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full mt-4">
          <button
            className=" flex justify-center items-center w-full bg-green-500 hover:bg-green-600 font-semibold p-2 transition-all duration-300 rounded-lg text-white  "
            onClick={handleSavePlan}
          >
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanItemSelection;
