import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaClipboardList,
  FaBox,
  FaTruck,
  FaShoppingCart,
  FaUsers,
  FaBars,
  FaSignOutAlt,
  FaUtensilSpoon,
  FaCreditCard,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </div>
      <ul>
        <li>
          <NavLink
            to="/plans"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaClipboardList className="icon" /> <span>Plans</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/items"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaBox className="icon" /> <span>Items</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/payment-options"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaCreditCard className="icon" /> <span>Payment</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/delivery"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaTruck className="icon" /> <span>Delivery</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaShoppingCart className="icon" /> <span>Orders</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/banners-container"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUtensilSpoon className="icon" /> <span>Banners</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUsers className="icon" /> <span>Users</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/logout" className="logout-button">
            <FaSignOutAlt className="icon" /> <span>Logout</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
