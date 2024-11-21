import React from "react";
import { NavLink, Link } from "react-router-dom";
import { logout } from "../utils/api";
import "../styles/Navbar.css";

const Navbar = () => {
  // const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // Using window.location for consistent reload
  };

  return (
    <div className="nav-container">
      <div className="nav-left">
        <Link to="/" className="nav-heading">
          <strong>Kitchen Dashboard</strong>
        </Link>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Orders
        </NavLink>
      </div>
      <div className="nav-right">
        <button onClick={handleLogout} className="nav-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
