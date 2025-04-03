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
    <div className="bg-white h-screen text-gray-800 overflow-y-scroll  p-6">
      <div className="p-6 bg-gray-100 h-full overflow-auto rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-left  text-2xl font-semibold m-0">Meal Plans</h1>

          <div className="m-0">
            <button
              className="px-4 py-3 bg-gray-300 text-gray-800 font-semibold hover:bg-gray-800 hover:text-white transition-all ease-in-out duration-300"
              onClick={() => navigate("/plans/create")}
            >
              Create New Plan
            </button>
          </div>
        </div>

        {plans.length > 0 ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 max-lg:grid-cols-4 grid-cols-1  place-items-center place-content-center gap-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className=" flex bg-white  rounded-xl w-fit max-h-[200px] h-[150px]  overflow-hidden  items-center justify-center"
              >
                <div className="w-40 h-full">
                  {plan.image && (
                    <img
                      src={plan.image}
                      alt={plan.nameEnglish}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex gap-2 p-2">
                  <div className=" flex flex-col   p-2 justify-center">
                    <h2 className="text-xl font-bold">{plan.nameEnglish}</h2>
                    <div className="flex text-sm my-1  text-gray-500 gap-1">
                      <span className="">Service Type: </span>
                      <span className="text-gray-800 font-semibold">
                        {getServiceLabel(plan.service)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-4 text-lg">
                    {/* Edit Plan Button */}
                    <div className="relative group flex items-center">
                      {/* Tooltip (Left Side, Adjusted Position) */}
                      <span className="absolute -left-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        Edit Plan
                      </span>
                      <button
                        className=" ml-4 hover:text-green-500"
                        onClick={() => navigate(`/plans/edit/${plan._id}`)}
                      >
                        <FaEdit />
                      </button>
                    </div>

                    {/* Delete Plan Button */}
                    <div className="relative group flex items-center">
                      {/* Tooltip (Left Side, Adjusted Position) */}
                      <span className="absolute -left-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        Delete Plan
                      </span>
                      <button
                        className="admin-delete-btn ml-4  hover:text-red-500"
                        onClick={() => handleDelete(plan._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Add/Edit Items Button */}
                    <div className="relative group flex items-center">
                      {/* Tooltip (Left Side, Adjusted Position) */}
                      <span className="absolute -left-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {plansWithItems[plan._id] ? "Edit Items" : "Add Items"}
                      </span>
                      <button
                        className={`  hover:text-blue-700 admin-${
                          plansWithItems[plan._id] ? "edit" : "add"
                        }-items-btn ml-4`}
                        onClick={() =>
                          handleAddOrEditItems(
                            plan._id,
                            plansWithItems[plan._id]
                          )
                        }
                      >
                        <FaListAlt />
                      </button>
                    </div>
                  </div>
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
