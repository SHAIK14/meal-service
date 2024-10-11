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
  const [weekMenu, setWeekMenu] = useState({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const [availableMeals, setAvailableMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlanDetails = useCallback(async () => {
    try {
      console.log("Fetching plan details for planId:", planId);
      const result = await getPlanById(planId);
      console.log("Plan details result:", result);

      if (result.success) {
        setPlan(result.data.plan);
      } else {
        console.error("Failed to fetch plan details:", result.error);
        setError(result.error || "Failed to fetch plan details");
      }
    } catch (error) {
      console.error("Error in fetchPlanDetails:", error);
      setError("An error occurred while fetching plan details");
    }
  }, [planId]);

  const fetchWeekMenu = useCallback(async () => {
    try {
      console.log("Fetching week menu for planId:", planId);
      const result = await getWeekMenu(planId);
      console.log("Week menu result:", result);

      if (result.success) {
        const weekMenuData = result.data.weekMenu || {};
        const processedWeekMenu = Object.fromEntries(
          Object.entries(weekMenuData).map(([key, value]) => [
            key,
            Array.isArray(value) ? value : [],
          ])
        );
        console.log("Processed weekMenu:", processedWeekMenu);
        setWeekMenu(processedWeekMenu);
      } else {
        console.error("Failed to fetch week menu:", result.error);
        setError(result.error || "Failed to fetch week menu");
      }
    } catch (error) {
      console.error("Error in fetchWeekMenu:", error);
      setError("An error occurred while fetching week menu");
    }
  }, [planId]);

  const fetchAvailableMeals = useCallback(async () => {
    try {
      console.log("Fetching available meals");
      const result = await getAllItems();
      console.log("Available meals result:", result);

      if (result.success) {
        setAvailableMeals(result.items || []);
      } else {
        console.error("Failed to fetch available meals:", result.error);
        setError(result.error || "Failed to fetch available meals");
      }
    } catch (error) {
      console.error("Error in fetchAvailableMeals:", error);
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
    console.log("Adding meal:", meal);
    console.log("Current weekMenu:", weekMenu);
    console.log("Selected day:", selectedDay);

    const dayMenu = weekMenu[selectedDay] || [];
    const isMealSelected = dayMenu.some(
      (selectedMeal) => selectedMeal._id === meal._id
    );

    if (isMealSelected) {
      alert("This meal has already been selected for the current day.");
      return;
    }

    setWeekMenu((prevWeekMenu) => {
      const updatedMenu = {
        ...prevWeekMenu,
        [selectedDay]: [...dayMenu, meal],
      };
      console.log("Updated weekMenu:", updatedMenu);
      return updatedMenu;
    });
  };

  const handleRemoveMeal = (mealId) => {
    console.log("Removing meal with id:", mealId);
    console.log("Current weekMenu:", weekMenu);
    console.log("Selected day:", selectedDay);

    setWeekMenu((prevWeekMenu) => {
      const updatedMenu = {
        ...prevWeekMenu,
        [selectedDay]: (prevWeekMenu[selectedDay] || []).filter(
          (meal) => meal._id !== mealId
        ),
      };
      console.log("Updated weekMenu after removal:", updatedMenu);
      return updatedMenu;
    });
  };

  const calculateTotalPrice = () => {
    let total = 0;
    for (let day in weekMenu) {
      total += (weekMenu[day] || []).reduce(
        (acc, meal) => acc + (meal.prices[0]?.sellingPrice || 0),
        0
      );
    }
    return total.toFixed(2);
  };

  const handleSavePlan = async () => {
    try {
      console.log("Saving plan with weekMenu:", weekMenu);
      const result = await updateWeekMenu(planId, {
        weekMenu,
        totalPrice: calculateTotalPrice(),
      });
      console.log("Save plan result:", result);

      if (result.success) {
        alert("Plan items saved successfully");
        navigate("/plans");
      } else {
        console.error("Failed to save plan items:", result.error);
        setError(result.error || "Failed to save plan items");
      }
    } catch (error) {
      console.error("Error in handleSavePlan:", error);
      setError("An error occurred while saving plan items");
    }
  };

  console.log("Rendering PlanItemSelection component");
  console.log("Current plan:", plan);
  console.log("Current weekMenu:", weekMenu);
  console.log("Available meals:", availableMeals);

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
        {["1", "2", "3", "4", "5"].map((day) => (
          <button
            key={day}
            className={`day-button ${selectedDay === day ? "active" : ""}`}
            onClick={() => setSelectedDay(day)}
          >
            Day {day}
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
                >
                  <img src={meal.image} alt={meal.nameEnglish} />
                  <h3>{meal.nameEnglish}</h3>
                  <div className="meal-info">
                    <p>{meal.calories} kcal</p>
                    <p className="price">{meal.prices[0]?.sellingPrice} SAR</p>
                  </div>
                  <button
                    className="select-meal-btn global-btn"
                    onClick={() => handleAddMeal(meal)}
                  >
                    Select
                  </button>
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
          <h2>Selected Meals for Day {selectedDay}</h2>
          <div className="selected-meals-list">
            {weekMenu[selectedDay] && weekMenu[selectedDay].length > 0 ? (
              weekMenu[selectedDay].map((meal) => (
                <div key={meal._id} className="selected-meal-card">
                  <img src={meal.image} alt={meal.nameEnglish} />
                  <div className="meal-info">
                    <h3>{meal.nameEnglish}</h3>
                    <p>{meal.calories} kcal</p>
                    <p className="price">{meal.prices[0]?.sellingPrice} SAR</p>
                  </div>
                  <button
                    className="remove-meal-btn"
                    onClick={() => handleRemoveMeal(meal._id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>
                No meals selected for this day. Drag items here to add meals, or
                select a meal from the left.
              </p>
            )}
          </div>
          <div className="total-price">
            <h2>
              <span className="side-heading">Total Price: </span>
              {calculateTotalPrice()} SAR
            </h2>
            <button className="save-plan-btn" onClick={handleSavePlan}>
              Save Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanItemSelection;
