import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaClipboardList,
  FaBox,
  FaTruck,
  FaShoppingCart,
  FaUsers,
  FaBars,
  FaMoneyCheckAlt, // Icon for Payments
  FaTicketAlt, // Icon for Vouchers
} from "react-icons/fa";
import "../styles/Sidebar.css"; // Your custom styles

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // State to control sidebar visibility

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle open/closed state
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </div>
      <ul>
        <li>
          <NavLink
            to="/plans" // This will be active for /plans and /plans/select-item
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
            to="/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUsers className="icon" /> <span>Users</span>
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
            to="/payments"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaMoneyCheckAlt className="icon" /> <span>Payments</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
