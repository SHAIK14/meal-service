import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/PlanItemSelection.css";
import {
  getPlanById,
  getAllItems,
  updateWeekMenu,
  getWeekMenu,
  getItemById,
} from "../utils/api";

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

const PlanItemEdit = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(WEEK_DAYS[0]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [weekMenu, setWeekMenu] = useState({});
  const [availableMeals, setAvailableMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packagePrices, setPackagePrices] = useState({});
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const fetchMealDetails = async (mealId) => {
    if (!mealId) {
      console.warn("Attempted to fetch meal with undefined ID");
      return null;
    }

    try {
      const result = await getItemById(mealId);
      if (result.success) {
        return result.item;
      } else {
        console.error(
          `Failed to fetch meal details for ID ${mealId}: ${
            result.error || "Unknown error"
          }`
        );
        return null;
      }
    } catch (error) {
      console.error(`Error fetching meal details for ID ${mealId}:`, error);
      return null;
    }
  };

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
    try {
      const result = await getWeekMenu(planId);
      if (result.success) {
        const weekMenuData = result.data.weekMenu || {};
        const processedWeekMenu = {};

        // Process week menu data
        for (const [day, packages] of Object.entries(weekMenuData)) {
          processedWeekMenu[day] = {};
          for (const [pkg, meals] of Object.entries(packages)) {
            // Filter out undefined/null meals before processing
            const validMeals = meals.filter((mealId) => mealId);

            // Fetch complete meal details for each meal ID
            processedWeekMenu[day][pkg] = await Promise.all(
              validMeals.map(async (mealId) => {
                const meal = await fetchMealDetails(mealId);
                return meal || null;
              })
            );

            // Filter out null values after fetching
            processedWeekMenu[day][pkg] = processedWeekMenu[day][pkg].filter(
              (meal) => meal
            );
          }
        }

        setWeekMenu(processedWeekMenu);

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

  const handleDragStart = (event, meal) => {
    event.dataTransfer.setData("meal", JSON.stringify(meal));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const meal = JSON.parse(event.dataTransfer.getData("meal"));
    handleAddMeal(meal);
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
        alert("Plan updated successfully");
        navigate("/plans");
      } else {
        setError(result.error || "Failed to update plan");
      }
    } catch (error) {
      setError("An error occurred while updating plan");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!plan) return <div className="error">Plan not found</div>;

  return (
    <div className="plan-item-selection-container">
      <h1>Edit Items for {plan.nameEnglish}</h1>

      <div className="service-info">
        <span className="service-label">Service Type:</span>
        <span className="service-value">
          {plan.service.charAt(0).toUpperCase() +
            plan.service.slice(1).replace(/([A-Z])/g, " $1")}
        </span>
      </div>

      <div className="days-nav">
        {WEEK_DAYS.map((day) => (
          <button
            key={day}
            className={`day-button ${selectedDay === day ? "active" : ""}`}
            onClick={() => setSelectedDay(day)}
          >
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </button>
        ))}
      </div>

      <div className="package-nav">
        {plan.package.map((pkg) => (
          <button
            key={pkg}
            className={`package-button ${
              selectedPackage === pkg ? "active" : ""
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
          </button>
        ))}
      </div>

      <div className="content-wrapper">
        <div className="available-meals">
          <h2>Available Meals</h2>
          <div className="meals-list">
            {availableMeals.length > 0 ? (
              availableMeals.map((meal) => (
                <div
                  key={meal._id}
                  className="meal-card"
                  draggable
                  onDragStart={(event) => handleDragStart(event, meal)}
                  onClick={() => handleAddMeal(meal)}
                >
                  <div className="meal-image-container">
                    <img
                      src={meal.image}
                      alt={meal.nameEnglish}
                      className="meal-image"
                    />
                  </div>
                  <h3 className="meal-name">{meal.nameEnglish}</h3>
                </div>
              ))
            ) : (
              <p>No meals available for {plan.service} service.</p>
            )}
          </div>
        </div>

        <div
          className="selected-meals"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <h2>
            Selected Meals for{" "}
            {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} -{" "}
            {selectedPackage?.charAt(0).toUpperCase() +
              selectedPackage?.slice(1)}
          </h2>
          <div className="selected-meals-list">
            {weekMenu[selectedDay]?.[selectedPackage]?.length > 0 ? (
              weekMenu[selectedDay][selectedPackage].map((meal) => (
                <div key={meal._id} className="selected-meal-card">
                  <div className="meal-image-container">
                    <img
                      src={meal.image}
                      alt={meal.nameEnglish}
                      className="meal-image"
                    />
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveMeal(meal._id)}
                    >
                      <span className="remove-icon">-</span>
                    </button>
                  </div>
                  <h3 className="meal-name">{meal.nameEnglish}</h3>
                </div>
              ))
            ) : (
              <p>
                No meals selected for this package and day. Drag or Select the
                Meal
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="package-pricing-section">
        <h2>Package Prices (Per Day)</h2>
        <div className="package-prices">
          {plan.package.map((pkg) => (
            <div key={pkg} className="package-price-input">
              <label>
                {pkg.charAt(0).toUpperCase() + pkg.slice(1)}:
                <div className="price-input-wrapper">
                  <input
                    type="number"
                    value={packagePrices[pkg] || ""}
                    onChange={(e) => handlePriceChange(pkg, e.target.value)}
                    placeholder="Enter price per day"
                    min="0"
                    required
                  />
                  <span className="currency">{currency}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="actions-section">
        <button className="save-button" onClick={handleSavePlan}>
          Save Plan
        </button>
      </div>
    </div>
  );
};

export default PlanItemEdit;
