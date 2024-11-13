// Plans.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaListAlt } from "react-icons/fa";
import { getAllPlans, deletePlan, getWeekMenu } from "../utils/api";
import "../styles/Plans.css";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [plansWithItems, setPlansWithItems] = useState({});
  const navigate = useNavigate();

  const fetchPlans = useCallback(async () => {
    try {
      const result = await getAllPlans();
      if (result.success) {
        setPlans(result.data);
        checkPlansWithItems(result.data);
      } else {
        console.error("Failed to fetch plans:", result.error);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const checkPlansWithItems = async (plans) => {
    const plansItemStatus = {};
    for (const plan of plans) {
      try {
        const weekMenuResult = await getWeekMenu(plan._id);
        plansItemStatus[plan._id] =
          weekMenuResult.success &&
          Object.values(weekMenuResult.data.weekMenu).some((day) =>
            Object.values(day).some((packageMeals) => packageMeals.length > 0)
          );
      } catch (error) {
        console.error(`Error checking items for plan ${plan._id}:`, error);
        plansItemStatus[plan._id] = false;
      }
    }
    setPlansWithItems(plansItemStatus);
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        const result = await deletePlan(planId);
        if (result.success) {
          fetchPlans();
        } else {
          console.error("Failed to delete plan:", result.error);
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

  const handleAddOrEditItems = (planId, hasItems) => {
    if (hasItems) {
      navigate(`/plans/${planId}/edit-items`);
    } else {
      navigate(`/plans/${planId}/add-items`);
    }
  };

  const getServiceLabel = (service) => {
    const labels = {
      subscription: "Subscription Service",
      indoorCatering: "Indoor Catering Service",
      outdoorCatering: "Outdoor Catering Service",
      dining: "Dining Service",
    };
    return labels[service] || "Not Specified";
  };

  return (
    <div className="admin-plans-wrapper">
      <div className="admin-plans-container">
        <h1>Meal Plans</h1>

        <div className="admin-create-plan-section">
          <button
            className="admin-create-plan-btn"
            onClick={() => navigate("/plans/create")}
          >
            Create New Plan
          </button>
        </div>

        {plans.length > 0 ? (
          <div className="admin-plans-list">
            {plans.map((plan) => (
              <div key={plan._id} className="admin-plan-card">
                <div className="admin-plan-image-container">
                  {plan.image && (
                    <img
                      src={plan.image}
                      alt={plan.nameEnglish}
                      className="admin-plan-image"
                    />
                  )}
                </div>
                <div className="admin-plan-details">
                  <h2>{plan.nameEnglish}</h2>
                  <div className="admin-service-info">
                    <span className="admin-service-label">Service Type:</span>
                    <span className="admin-service-value">
                      {getServiceLabel(plan.service)}
                    </span>
                  </div>
                </div>
                <div className="admin-plan-actions">
                  <button
                    className="admin-edit-btn"
                    onClick={() => navigate(`/plans/edit/${plan._id}`)}
                    title="Edit Plan"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="admin-delete-btn"
                    onClick={() => handleDelete(plan._id)}
                    title="Delete Plan"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className={`admin-${
                      plansWithItems[plan._id] ? "edit" : "add"
                    }-items-btn`}
                    onClick={() =>
                      handleAddOrEditItems(plan._id, plansWithItems[plan._id])
                    }
                    title={
                      plansWithItems[plan._id] ? "Edit Items" : "Add Items"
                    }
                  >
                    <FaListAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-no-plans">
            <p>No plans available. Create a new one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
