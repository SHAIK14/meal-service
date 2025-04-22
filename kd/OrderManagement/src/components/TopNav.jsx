import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getBranchDetails } from "../utils/api";

function TopNav() {
  const [branchName, setBranchName] = useState("");
  const orderCount = 70;

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const result = await getBranchDetails();
        if (result.success) {
          setBranchName(result.data.data.name);
        }
      } catch (error) {
        console.error("Error fetching branch details:", error);
      }
    };

    fetchBranchDetails();
  }, []);

  return (
    <div className="bg-gray-900 shadow-md w-full h-16 flex items-center px-4 fixed top-0 left-0 right-0 z-50">
      {branchName && (
        <div className="text-white font-semibold text-xl mr-6">
          {branchName}
        </div>
      )}
      <div className="flex space-x-6 overflow-x-auto whitespace-nowrap">
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/"
        >
          Kitchen Dashboard
        </NavLink>
        {/* <NavLink
          className={({ isActive }) =>
            `py-2 px-3 relative ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/orders"
        >
          Orders
          {orderCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {orderCount}
            </span>
          )}
        </NavLink> */}
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/diningKitchen"
        >
          Dining Kitchen
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/tables"
        >
          Dining Admin
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/catering"
        >
          Catering
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/takeaway-admin"
        >
          Takeaway Admin
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/takeaway-kitchen"
        >
          Takeaway Kitchen
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/meal-admin"
        >
          Meal Admin
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `py-2 px-3 ${
              isActive
                ? "text-white font-medium border-b-2 border-blue-500"
                : "text-gray-200 hover:text-blue-600"
            }`
          }
          to="/meal-kitchen"
        >
          Meal Kitchen
        </NavLink>
      </div>
    </div>
  );
}

export default TopNav;
