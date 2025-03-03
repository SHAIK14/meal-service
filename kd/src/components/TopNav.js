import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getBranchDetails } from "../utils/api";
import "../styles/TopNav.css";

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
    <div className="nav-container">
      {branchName && <div className="branch-logo">{branchName}</div>}
      <NavLink className="nav-item" to="/">
        Kitchen Dashboard
      </NavLink>
      <NavLink className="nav-item" to="/orders">
        Orders
        {orderCount > 0 && (
          <span className="notification-badge">{orderCount}</span>
        )}
      </NavLink>
      <NavLink className="nav-item" to="/Alacarte">
        A La Carte
      </NavLink>
      <NavLink className="nav-item" to="/tables">
        TableManagement
      </NavLink>
      <NavLink className="nav-item" to="/catering">
        Catering
      </NavLink>
    </div>
  );
}

export default TopNav;
