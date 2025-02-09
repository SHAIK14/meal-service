// Plans.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaListAlt } from "react-icons/fa";
import { getAllPlans, deletePlan, getWeekMenu } from "../utils/api";
// import "../styles/Plans.css";

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
    <div className="bg-white p-8 h-screen">
      <div className="">
        <div className="flex items-center  justify-between rounded-2xl p-4">
          <h1 className=" text-2xl font-bold text-black m-0 p-0">Meal Plans</h1>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-500 text-sm font-semibold text-black hover:text-white transition-all duration-300 bg-gray-100"
            onClick={() => navigate("/plans/create")}
          >
            Create New Plan
          </button>
        </div>

        {plans.length > 0 ? (
          <div className="grid sm:grid-cols-1 mt-4 md:grid-col-2 lg:grid-cols-3 place-content-center place-items-center w-fit gap-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="flex border items-center p-4 rounded-2xl gap-4 "
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden">
                  {plan.image && (
                    <img
                      src={plan.image}
                      alt={plan.nameEnglish}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="">
                  <h2 className="font-bold text-lg ">{plan.nameEnglish}</h2>
                  <div className="m-0 p-0">
                    <span className="font-semibold text-sm">
                      Service Type:{" "}
                    </span>
                    <span className="text-gray-700">
                      {getServiceLabel(plan.service)}
                    </span>
                  </div>
                </div>
                <div className=" flex  gap-2">
                  <button
                    className="relative bg-blue-500 text-sm p-2 text-white rounded-full hover:bg-blue-600 transition-all duration-300 group"
                    onClick={() => navigate(`/plans/edit/${plan._id}`)}
                    title="Edit Plan"
                  >
                    <FaEdit />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs text-white bg-black rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 group-hover:block transition-opacity duration-300">
                      Edit
                    </span>
                  </button>
                  <button
                    className="relative bg-red-500 text-sm p-2 text-white rounded-full hover:bg-red-600 transition-all duration-300 group"
                    onClick={() => handleDelete(plan._id)}
                    title="Delete Plan"
                  >
                    <FaTrash />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs text-white bg-black rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 group-hover:block transition-opacity duration-300">
                      Delete
                    </span>
                  </button>
                  <button
                    className={` relative bg-green-500 text-sm p-2 text-white rounded-full hover:bg-green-600 transition-all duration-300 group  admin-${
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
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs text-white bg-black rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 group-hover:block transition-opacity duration-300">
                      Items
                    </span>
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
