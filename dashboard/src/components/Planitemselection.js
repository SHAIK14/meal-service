import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/PlanItemSelection.css";
import {
  getPlanById,
  getAllItems,
  updateWeekMenu,
  getWeekMenu,
} from "../utils/api";

const PlanItemSelection = () => {
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

  const initializePackageDiscounts = (packages) => {
    const initialDiscounts = {};
    packages.forEach((pkg) => {
      initialDiscounts[pkg] = {
        discountValue: "",
        isCouponEligible: false,
      };
    });
    setPackageDiscounts(initialDiscounts);
  };

  const fetchPlanDetails = useCallback(async () => {
    try {
      const result = await getPlanById(planId);
      if (result.success) {
        setPlan(result.data.plan);
        setSelectedPackage(result.data.plan.package[0]);
        // Initialize weekMenu
        const initialWeekMenu = {};
        for (let i = 1; i <= result.data.plan.duration; i++) {
          initialWeekMenu[i] = {};
          result.data.plan.package.forEach((pkg) => {
            initialWeekMenu[i][pkg] = [];
          });
        }
        setWeekMenu(initialWeekMenu);
        initializePackageDiscounts(result.data.plan.package);
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
        setWeekMenu(result.data.weekMenu || {});
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
        // Filter meals based on plan service
        const filteredMeals = result.items.filter(
          (meal) => meal.services && meal.services[plan.service]
        );
        setAvailableMeals(filteredMeals);

        // Set currency from first meal if available
        if (result.items?.[0]?.prices?.[0]?.currency) {
          setCurrency(result.items[0].prices[0].currency);
        }
      } else {
        setError(result.error || "Failed to fetch available meals");
      }
    } catch (error) {
      setError("An error occurred while fetching available meals");
    }
  }, [plan?.service]); // Add plan.service as dependency

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

  // Add separate effect for fetching meals after plan is loaded
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

  const calculatePackagePrices = () => {
    const packageDetails = {};

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
      const packageDetails = calculatePackagePrices();
      const grandTotal = Object.values(packageDetails).reduce(
        (acc, pkg) => acc + pkg.finalPrice,
        0
      );

      const updateData = {
        weekMenu,
        packagePricing: {},
        totalPrice: grandTotal,
      };

      for (const [pkg, details] of Object.entries(packageDetails)) {
        updateData.packagePricing[pkg] = {
          totalPrice: details.totalPrice,
          discountPercentage:
            parseFloat(packageDiscounts[pkg]?.discountValue) || 0,
          finalPrice: details.finalPrice,
          isCouponEligible: packageDiscounts[pkg]?.isCouponEligible || false,
        };
      }

      const result = await updateWeekMenu(planId, updateData);

      if (result.success) {
        alert("Plan items saved successfully");
        navigate("/plans");
      } else {
        setError(result.error || "Failed to save plan items");
      }
    } catch (error) {
      setError("An error occurred while saving plan items");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!plan) return <div className="error">Plan not found</div>;

  const packagePrices = calculatePackagePrices();
  return (
    <div className="plan-item-selection-container">
      <h1>Select Items for {plan.nameEnglish}</h1>

      <div className="service-info">
        <span className="service-label">Service Type:</span>
        <span className="service-value">
          {plan.service.charAt(0).toUpperCase() +
            plan.service.slice(1).replace(/([A-Z])/g, " $1")}
        </span>
      </div>

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
        {Object.entries(packagePrices).map(([pkg, details]) => (
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
            {Object.values(packagePrices)
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

export default PlanItemSelection;
