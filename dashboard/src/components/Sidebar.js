import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useServiceAccess } from "../hooks/useServiceAccess";
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
  FaUsersCog,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { hasAccess, isAdmin } = useServiceAccess();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
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
        {isAdmin && (
          <>
            <li>
              <NavLink
                to="/role-service"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaUsersCog className="icon" /> <span>Roles & Services</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/staff-management"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaUsersCog className="icon" /> <span>Staff Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/staff-list"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaUsersCog className="icon" /> <span>Staff List</span>
              </NavLink>
            </li>
          </>
        )}

        {hasAccess("/branches") && (
          <li>
            <NavLink
              to="/branches"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaBuilding className="icon" /> <span>Branches</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/plans") && (
          <li>
            <NavLink
              to="/plans"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaClipboardList className="icon" /> <span>Plans</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/items") && (
          <li>
            <NavLink
              to="/items"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaBox className="icon" /> <span>Items</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/menuItems") && (
          <li>
            <NavLink
              to="/menuItems"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaBox className="icon" /> <span>Dining Items</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/subscriptions") && (
          <li>
            <NavLink
              to="/subscriptions"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaShoppingCart className="icon" /> <span>Subscriptions</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/vouchers") && (
          <li>
            <NavLink
              to="/vouchers"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaTicketAlt className="icon" /> <span>Vouchers</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/payment-options") && (
          <li>
            <NavLink
              to="/payment-options"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaCreditCard className="icon" /> <span>Payment</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/driver") && (
          <>
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
          </>
        )}

        {hasAccess("/banners") && (
          <li>
            <NavLink
              to="/banners-container"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaUtensilSpoon className="icon" /> <span>Banners</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/users") && (
          <li>
            <NavLink
              to="/users"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaUsers className="icon" /> <span>Users</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/configuration") && (
          <li>
            <NavLink
              to="/configuration"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaBook className="icon" /> <span>Config</span>
            </NavLink>
          </li>
        )}

        {hasAccess("/dining-config") && (
          <li>
            <NavLink
              to="/dining-config"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaUtensils className="icon" /> <span>Dining Config</span>
            </NavLink>
          </li>
        )}
        {hasAccess("/catering-config") && (
          <li>
            <NavLink
              to="/catering-config"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaUtensils className="icon" /> <span>Catering Config</span>
            </NavLink>
          </li>
        )}
        {hasAccess("/takeAway-config") && (
          <li>
            <NavLink
              to="/takeAway-config"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaUtensils className="icon" /> <span>TakeAway Config</span>
            </NavLink>
          </li>
        )}

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
