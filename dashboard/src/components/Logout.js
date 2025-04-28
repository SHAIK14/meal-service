import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/api";

const Logout = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        localStorage.removeItem("adminToken");
        setIsLoggedIn(false);
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    performLogout();
  }, [navigate, setIsLoggedIn]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
