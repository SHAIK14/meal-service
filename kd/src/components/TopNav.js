// src/components/TopNav.js
import React from "react";
import { NavLink, Link } from "react-router-dom";
import "../styles/TopNav.css";

function TopNav() {
  // Example order count; replace this with dynamic data as needed
  const orderCount = 70; // This is just a static example; ensure this value changes accordingly

  return (
    <div className="nav-container">
      <Link to="/" className="nav-heading">
        <strong>Kitchen Dashboard</strong>
      </Link>
      <NavLink className="nav-item" to="/orders" activeClassName="active">
        Orders
        {/* Notification badge */}
        {orderCount > 0 && (
          <span className="notification-badge">{orderCount}</span>
        )}
      </NavLink>
    </div>
  );
}

export default TopNav;
