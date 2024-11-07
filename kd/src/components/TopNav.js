// src/components/TopNav.js
import React from "react";
import { NavLink, Link } from "react-router-dom";
import "../styles/TopNav.css";

function TopNav() {
  const orderCount = 70;

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
      <NavLink className="nav-item" to="/Alacarte" activeClassName="active">
        A La Carte
      </NavLink>
    </div>
  );
}

export default TopNav;
