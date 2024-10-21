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

  const fetchPlanDetails = useCallback(async () => {
    try {
      const result = await getPlanById(planId);
      if (result.success) {
        setPlan(result.data.plan);
        setSelectedPackage(result.data.plan.package[0]);
        // Initialize weekMenu based on plan duration and packages
        const initialWeekMenu = {};
        for (let i = 1; i <= result.data.plan.duration; i++) {
          initialWeekMenu[i] = {};
          result.data.plan.package.forEach((pkg) => {
            initialWeekMenu[i][pkg] = [];
          });
        }
        setWeekMenu(initialWeekMenu);
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
        setAvailableMeals(result.items || []);
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
      try {
        await Promise.all([
          fetchPlanDetails(),
          fetchWeekMenu(),
          fetchAvailableMeals(),
        ]);
      } catch (error) {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
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

  const calculateTotalPrice = () => {
    let total = 0;
    for (let day in weekMenu) {
      for (let pkg in weekMenu[day]) {
        total += (weekMenu[day][pkg] || []).reduce((acc, meal) => {
          const price = meal?.prices?.[0]?.sellingPrice || 0;
          return acc + price;
        }, 0);
      }
    }
    return total.toFixed(2);
  };

  const handleSavePlan = async () => {
    try {
      const result = await updateWeekMenu(planId, {
        weekMenu,
        totalPrice: calculateTotalPrice(),
      });
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
      <h1>Select Items for {plan.nameEnglish}</h1>
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
                        {meal.prices?.[0]?.sellingPrice || 0} SAR
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
                        {meal.prices?.[0]?.sellingPrice || 0} SAR
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
          <div className="total-price">
            <h3>Total Price: {calculateTotalPrice()} SAR</h3>
            <button onClick={handleSavePlan}>Save Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanItemSelection;
