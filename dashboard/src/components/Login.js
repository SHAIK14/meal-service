import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/api";
import "../styles/Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDebugInfo("Attempting login...");

    try {
      console.log("Login attempt with username:", username);
      const result = await login(username, password);
      console.log("Login API response:", result);

      if (result.success) {
        setDebugInfo("Login successful. Updating state and redirecting...");
        setIsLoggedIn(true);
        localStorage.setItem("adminToken", result.data.token);
        console.log("Token stored in localStorage");
        navigate("/plans");
      } else {
        setDebugInfo(`Login failed: ${result.error}`);
        setError(result.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setDebugInfo(`Unexpected error: ${error.message}`);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h3 className="login-title">Login to your account</h3>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <div className="debug-info">
          <h4>Debug Information:</h4>
          <pre>{debugInfo}</pre>
        </div>
      </div>
    </div>
  );
};

export default Login;
