import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { kitchenLogin } from "../../utils/api";
import "../../styles/Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await kitchenLogin(pincode, password);
      if (result.success) {
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="kitchen-login-container">
      <div className="kitchen-login-box">
        <h2>Kitchen Login</h2>
        {error && <div className="kitchen-error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="kitchen-form-group">
            <input
              type="text"
              placeholder="Enter Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>
          <div className="kitchen-form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="kitchen-login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
