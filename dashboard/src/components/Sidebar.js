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
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Group menu items for better organization
  const adminMenuItems = [
    { path: "/role-service", icon: <FaUsersCog />, label: "Roles & Services" },
    {
      path: "/staff-management",
      icon: <FaUsersCog />,
      label: "Staff Management",
    },
    { path: "/staff-list", icon: <FaUsersCog />, label: "Staff List" },
  ];

  const regularMenuItems = [
    {
      path: "/branches",
      icon: <FaBuilding />,
      label: "Branches",
      access: "/branches",
    },
    {
      path: "/plans",
      icon: <FaClipboardList />,
      label: "Plans",
      access: "/plans",
    },
    { path: "/items", icon: <FaBox />, label: "Items", access: "/items" },
    // New dashboard entry to add
    {
      path: "/items-dashboard",
      icon: <FaBox />,
      label: "Items Dashboard",
      access: "/items",
    },
    {
      path: "/menuItems",
      icon: <FaBox />,
      label: "Dining Items",
      access: "/menuItems",
    },
    {
      path: "/subscriptions",
      icon: <FaShoppingCart />,
      label: "Subscriptions",
      access: "/subscriptions",
    },
    {
      path: "/catering",
      icon: <FaShoppingCart />,
      label: "Catering",
      access: "/catering",
    },
    {
      path: "/cateringOrders",
      icon: <FaShoppingCart />,
      label: "Catering Orders",
      access: "/cateringOrders",
    },
    {
      path: "/vouchers",
      icon: <FaTicketAlt />,
      label: "Vouchers",
      access: "/vouchers",
    },
    {
      path: "/payment-options",
      icon: <FaCreditCard />,
      label: "Payment",
      access: "/payment-options",
    },
  ];

  const deliveryMenuItems = [
    {
      path: "/driver/register",
      icon: <FaTruck />,
      label: "Delivery Register",
      access: "/driver",
    },
    {
      path: "/driver/management",
      icon: <FaTruck />,
      label: "Delivery Management",
      access: "/driver",
    },
  ];

  const configMenuItems = [
    {
      path: "/banners-container",
      icon: <FaUtensilSpoon />,
      label: "Banners",
      access: "/banners",
    },
    { path: "/users", icon: <FaUsers />, label: "Users", access: "/users" },
    {
      path: "/configuration",
      icon: <FaBook />,
      label: "Config",
      access: "/configuration",
    },
    {
      path: "/dining-config",
      icon: <FaUtensils />,
      label: "Dining Config",
      access: "/dining-config",
    },
    {
      path: "/catering-config",
      icon: <FaUtensils />,
      label: "Catering Config",
      access: "/catering-config",
    },
    {
      path: "/takeAway-config",
      icon: <FaUtensils />,
      label: "TakeAway Config",
      access: "/takeAway-config",
    },
  ];

  const renderMenuItem = (item) => {
    if (item.access && !hasAccess(item.access)) return null;

    return (
      <li
        key={item.path}
        className="mb-1"
        onMouseEnter={() => setHoveredItem(item.path)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `flex items-center p-3  transition-all duration-300 ${
              isActive
                ? "bg-gray-100 text-black "
                : "text-gray-600 hover:bg-gray-100"
            } ${hoveredItem === item.path ? "transform scale-105" : ""}`
          }
        >
          <span className={`text-lg ${!isOpen ? "mx-auto" : "mr-3"}`}>
            {item.icon}
          </span>
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
            }`}
          >
            {item.label}
          </span>
          {!isOpen && hoveredItem === item.path && (
            <div className="absolute left-16 bg-white shadow-lg text-black px-3 py-2 rounded  z-10 whitespace-nowrap">
              {item.label}
            </div>
          )}
        </NavLink>
      </li>
    );
  };

  const renderSection = (title, items) => {
    const filteredItems = items.filter(
      (item) => !item.access || hasAccess(item.access)
    );
    if (filteredItems.length === 0) return null;

    return (
      <div className="mb-4">
        {isOpen && (
          <div className="text-xs uppercase text-gray-500 font-semibold pl-4 mt-4 mb-2">
            {title}
          </div>
        )}
        <ul>{filteredItems.map(renderMenuItem)}</ul>
      </div>
    );
  };

  return (
    <div
      className={`bg-gradient-to-b bg-white z-10  shadow-lg  h-screen
        flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-20"
        } shadow-xl`}
    >
      <div className="flex justify-between items-center p-4  border-gray-700">
        <div className={`flex items-center ${isOpen ? "" : "hidden"}`}>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Admin
          </span>
        </div>
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
          onClick={toggleSidebar}
        >
          <FaBars
            className={`transform transition-transform duration-300 ${
              !isOpen
                ? "rotate-180 transition-all ease-in-out duration-300"
                : ""
            }`}
          />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden ">
        {isAdmin && renderSection("Administration", adminMenuItems)}
        {renderSection("General", regularMenuItems)}
        {renderSection("Delivery", deliveryMenuItems)}
        {renderSection("Configuration", configMenuItems)}
      </div>

      <div className="mt-auto  border-gray-700">
        <NavLink
          to="/logout"
          className="flex items-center p-4 text-red-400 hover:bg-gray-200 transition-all duration-200"
        >
          <span className={`text-lg ${!isOpen ? "mx-auto" : "mr-3"}`}>
            <FaSignOutAlt />
          </span>
          <span
            className={`transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Logout
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
