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
  FaTicketAlt,
  FaBook,
  FaBuilding,
  FaUtensils,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const handleMouseEnter = () => {
    setIsOpen(true); // Open sidebar on hover
  };
  const handleMouseLeave = () => {
    setIsOpen(false); // Close sidebar when not hovered
  };

  return (
    <div
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </div>
      <ul>
        <li>
          <NavLink
            to="/branches"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaBuilding className="icon" /> <span>Branches</span>
          </NavLink>
        </li>
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
            to="/menuItems"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaBox className="icon" /> <span>Dining Items</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/subscriptions"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaShoppingCart className="icon" /> <span>Subscriptions</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/Vouchers"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaTicketAlt className="icon" /> <span>Vouchers</span>
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
            to="/driver/register"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaTruck className="icon" /> <span>DeliveryRegister</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/driver/management"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaTruck className="icon" /> <span>DeliveryManagement</span>
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
          <NavLink
            to="/Configuration"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaBook className="icon" /> <span>Config</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dining-config"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUtensils className="icon" /> <span>Dining Config</span>
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
