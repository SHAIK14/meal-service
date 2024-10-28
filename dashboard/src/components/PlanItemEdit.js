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

const PlanItemEdit = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState("1");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [weekMenu, setWeekMenu] = useState({});
  const [availableMeals, setAvailableMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packageDiscounts, setPackageDiscounts] = useState({});
  const [currency, setCurrency] = useState("");

  const initializePackageDiscounts = useCallback(
    (packages, existingPricing = {}) => {
      const initialDiscounts = {};
      packages.forEach((pkg) => {
        initialDiscounts[pkg] = {
          discountValue:
            existingPricing[pkg]?.discountPercentage?.toString() || "",
          isCouponEligible: existingPricing[pkg]?.isCouponEligible || false,
        };
      });
      setPackageDiscounts(initialDiscounts);
    },
    []
  );

  const fetchPlanDetails = useCallback(async () => {
    try {
      const result = await getPlanById(planId);
      if (result.success) {
        setPlan(result.data.plan);
        setSelectedPackage(result.data.plan.package[0]);

        // Initialize empty week menu if needed
        const initialWeekMenu = {};
        for (let i = 1; i <= result.data.plan.duration; i++) {
          initialWeekMenu[i] = {};
          result.data.plan.package.forEach((pkg) => {
            initialWeekMenu[i][pkg] = [];
          });
        }
        setWeekMenu((prev) => ({ ...prev, ...initialWeekMenu }));

        // Initialize discounts with existing package pricing if available
        if (result.data.plan.packagePricing) {
          initializePackageDiscounts(
            result.data.plan.package,
            result.data.plan.packagePricing
          );
        } else {
          initializePackageDiscounts(result.data.plan.package);
        }
      } else {
        setError(result.error || "Failed to fetch plan details");
      }
    } catch (error) {
      setError("An error occurred while fetching plan details");
    }
  }, [planId, initializePackageDiscounts]);

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

        // Set currency from available meals instead of week menu
        const firstValidMeal = Object.values(processedWeekMenu)
          .flatMap((day) => Object.values(day))
          .flat()
          .find((meal) => meal?.prices?.[0]?.currency);

        if (firstValidMeal?.prices?.[0]?.currency) {
          setCurrency(firstValidMeal.prices[0].currency);
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
        setAvailableMeals(result.items || []);
        if (result.items?.[0]?.prices?.[0]?.currency) {
          setCurrency(result.items[0].prices[0].currency);
        }
      } else {
        setError(result.error || "Failed to fetch available meals");
      }
    } catch (error) {
      setError("An error occurred while fetching available meals");
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPlanDetails(),
        fetchWeekMenu(),
        fetchAvailableMeals(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [fetchPlanDetails, fetchWeekMenu, fetchAvailableMeals]);

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
  const calculatePackagePrices = () => {
    const packageDetails = {};

    // Calculate total for each package
    for (let day in weekMenu) {
      for (let pkg in weekMenu[day]) {
        const packageTotal = (weekMenu[day][pkg] || []).reduce((acc, meal) => {
          const price = meal?.prices?.[0]?.sellingPrice || 0;
          return acc + price;
        }, 0);

        if (!packageDetails[pkg]) {
          packageDetails[pkg] = { totalPrice: 0 };
        }
        packageDetails[pkg].totalPrice += packageTotal;
      }
    }

    // Calculate discounts and final prices
    for (let pkg in packageDetails) {
      const discountPercent =
        parseFloat(packageDiscounts[pkg]?.discountValue) || 0;
      const discountAmount =
        (packageDetails[pkg].totalPrice * discountPercent) / 100;

      packageDetails[pkg] = {
        ...packageDetails[pkg],
        discountPercent,
        discountAmount,
        isCouponEligible: packageDiscounts[pkg]?.isCouponEligible || false,
        finalPrice: packageDetails[pkg].totalPrice - discountAmount,
      };
    }

    return packageDetails;
  };

  const handleDiscountChange = (pkg, field, value) => {
    if (field === "discountValue") {
      if (value === "") {
        setPackageDiscounts((prev) => ({
          ...prev,
          [pkg]: { ...prev[pkg], discountValue: "" },
        }));
        return;
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

      const cleanValue = numValue.toString();

      setPackageDiscounts((prev) => ({
        ...prev,
        [pkg]: { ...prev[pkg], discountValue: cleanValue },
      }));
    } else {
      setPackageDiscounts((prev) => ({
        ...prev,
        [pkg]: { ...prev[pkg], [field]: value },
      }));
    }
  };

  const handleSavePlan = async () => {
    try {
      // Convert weekMenu to only include meal IDs
      const weekMenuIds = {};
      for (const [day, packages] of Object.entries(weekMenu)) {
        weekMenuIds[day] = {};
        for (const [pkg, meals] of Object.entries(packages)) {
          weekMenuIds[day][pkg] = meals.map((meal) => meal._id);
        }
      }

      // Calculate package details
      const packageDetails = calculatePackagePrices();
      const packagePricing = {};

      // Transform package details into the correct format
      for (const [pkg, details] of Object.entries(packageDetails)) {
        packagePricing[pkg] = {
          totalPrice: details.totalPrice,
          discountPercentage:
            parseFloat(packageDiscounts[pkg]?.discountValue) || 0,
          finalPrice: details.finalPrice,
          isCouponEligible: packageDiscounts[pkg]?.isCouponEligible || false,
        };
      }

      const grandTotal = Object.values(packageDetails).reduce(
        (acc, pkg) => acc + pkg.finalPrice,
        0
      );

      const result = await updateWeekMenu(planId, {
        weekMenu: weekMenuIds,
        packagePricing, // Changed from packageDetails to packagePricing
        totalPrice: grandTotal,
      });

      if (result.success) {
        alert("Plan items updated successfully");
        navigate("/plans");
      } else {
        setError(result.error || "Failed to update plan items");
      }
    } catch (error) {
      setError("An error occurred while updating plan items");
      console.error("Update error:", error);
    }
  };
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!plan) {
    return <div className="error">Plan not found</div>;
  }

  return (
    <div className="plan-item-selection-container">
      <h1>Edit Items for {plan.nameEnglish}</h1>
      <div className="days-nav">
        {[...Array(plan.duration)].map((_, index) => {
          const day = (index + 1).toString();
          return (
            <button
              key={day}
              className={`day-button ${selectedDay === day ? "active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              Day {day}
            </button>
          );
        })}
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
                    <div className="meal-overlay">
                      <p className="meal-calories">{meal.calories} kcal</p>
                      <p className="meal-price">
                        {meal.prices?.[0]?.sellingPrice || 0} {currency}
                      </p>
                    </div>
                  </div>
                  <h3 className="meal-name">{meal.nameEnglish}</h3>
                </div>
              ))
            ) : (
              <p>No available meals found.</p>
            )}
          </div>
        </div>

        <div
          className="selected-meals"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <h2>
            Selected Meals for Day {selectedDay} -{" "}
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
                    <div className="meal-overlay">
                      <p className="meal-calories">{meal.calories} kcal</p>
                      <p className="meal-price">
                        {meal.prices?.[0]?.sellingPrice || 0} {currency}
                      </p>
                    </div>
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

      <div className="pricing-section">
        {Object.entries(calculatePackagePrices()).map(([pkg, details]) => (
          <div key={pkg} className="package-pricing">
            <div className="package-price-info">
              <span className="package-name">
                {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
              </span>
              <span className="package-total">
                Total: {details.totalPrice.toFixed(2)} {currency}
              </span>
            </div>

            <div className="discount-section">
              <div className="discount-input-group">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={packageDiscounts[pkg]?.discountValue}
                  onChange={(e) =>
                    handleDiscountChange(pkg, "discountValue", e.target.value)
                  }
                  placeholder="Discount "
                  className="discount-input"
                />
                <span className="percentage-symbol">%</span>
              </div>

              <label className="coupon-toggle">
                <input
                  type="checkbox"
                  checked={packageDiscounts[pkg]?.isCouponEligible}
                  onChange={(e) =>
                    handleDiscountChange(
                      pkg,
                      "isCouponEligible",
                      e.target.checked
                    )
                  }
                />
                <span>Coupon Eligible</span>
              </label>
            </div>

            {details.discountPercent > 0 && (
              <div className="discount-info">
                {details.discountAmount.toFixed(2)} {currency} off (
                {details.discountPercent}%)
              </div>
            )}

            <div className="final-price">
              Final: {details.finalPrice.toFixed(2)} {currency}
            </div>
          </div>
        ))}

        <div className="total-section">
          <span>Grand Total:</span>
          <span>
            {Object.values(calculatePackagePrices())
              .reduce((acc, pkg) => acc + pkg.finalPrice, 0)
              .toFixed(2)}{" "}
            {currency}
          </span>
        </div>

        <button className="save-button" onClick={handleSavePlan}>
          Save Plan
        </button>
      </div>
    </div>
  );
};

export default PlanItemEdit;
