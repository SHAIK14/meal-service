import React, { useState, useEffect } from "react";
import "../styles/PlanItemSelection.css";
import "../styles/global.css";

const PlanItemSelection = ({ onSavePlan }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [underlinePosition, setUnderlinePosition] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });

  // Available meal items
  const availableMeals = [
    {
      id: 1,
      name: "Chicken Biryani",
      price: 35,
      calories: 500,
      image: "https://via.placeholder.com/100",
    },
    {
      id: 2,
      name: "Veg Pulao",
      price: 25,
      calories: 300,
      image: "https://via.placeholder.com/100",
    },
    {
      id: 3,
      name: "Fish Curry",
      price: 45,
      calories: 450,
      image: "https://via.placeholder.com/100",
    },
  ];

  const handleDragStart = (event, meal) => {
    event.dataTransfer.setData("meal", JSON.stringify(meal));
  };

  const handleDrop = (event) => {
    const meal = JSON.parse(event.dataTransfer.getData("meal"));
    handleAddMeal(meal);
  };

  const handleAddMeal = (meal) => {
    // Check if the meal is already selected for the current day
    const isMealSelected = selectedMeals[selectedDay].some(
      (selectedMeal) => selectedMeal.id === meal.id
    );

    if (isMealSelected) {
      alert("This meal has already been selected for the current day.");
      return; // Prevent adding the meal again
    }

    // Add the meal to the selected meals for the current day
    setSelectedMeals((prevSelectedMeals) => ({
      ...prevSelectedMeals,
      [selectedDay]: [...prevSelectedMeals[selectedDay], meal],
    }));
  };

  const handleRemoveMeal = (mealId) => {
    setSelectedMeals((prevSelectedMeals) => ({
      ...prevSelectedMeals,
      [selectedDay]: prevSelectedMeals[selectedDay].filter(
        (meal) => meal.id !== mealId
      ),
    }));
  };

  const calculateTotalPrice = () => {
    let total = 0;
    for (let day in selectedMeals) {
      total += selectedMeals[day].reduce((acc, meal) => acc + meal.price, 0);
    }
    return total;
  };

  const handleSavePlan = () => {
    alert("Your plan is saved successfully");
  };

  useEffect(() => {
    const position = (selectedDay - 1) * 100;
    setUnderlinePosition(position);
  }, [selectedDay]);

  return (
    <div className="plan-item-selection-container">
      <div className="days-nav">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            className={`day-button ${selectedDay === day ? "active" : ""}`}
            onClick={() => setSelectedDay(day)}
          >
            Day {day}
          </button>
        ))}
        <div
          className="underline"
          style={{ left: `${underlinePosition}px` }}
        ></div>
      </div>

      <div className="content-wrapper">
        <div className="available-meals">
          <h2>Available Meals</h2>
          <div className="meals-list">
            {availableMeals.map((meal) => (
              <div
                key={meal.id}
                className="meal-card"
                draggable
                onDragStart={(event) => handleDragStart(event, meal)}
              >
                <img src={meal.image} alt={meal.name} />
                <h3>{meal.name}</h3>
                <div className="meal-info">
                  <p>{meal.calories} kcal</p>
                  <p className="price">{meal.price} SAR</p>
                </div>
                <button
                  className="select-meal-btn global-btn"
                  onClick={() => handleAddMeal(meal)}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        <div
          className="selected-meals"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <h2>Selected Meals for Day {selectedDay}</h2>
          <div className="selected-meals-list">
            {selectedMeals[selectedDay].length > 0 ? (
              selectedMeals[selectedDay].map((meal) => (
                <div key={meal.id} className="selected-meal-card">
                  <img src={meal.image} alt={meal.name} />
                  <div className="meal-info">
                    <h3>{meal.name}</h3>
                    <p>{meal.calories} kcal</p>
                    <p className="price">{meal.price} SAR</p>
                  </div>
                  <button
                    className="remove-meal-btn"
                    onClick={() => handleRemoveMeal(meal.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>
                Drag items here to add meals, or select a meal from the left.
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
