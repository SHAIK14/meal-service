import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/api";

// import "../styles/Login.css";

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
    <div className="w-full h-screen overflow-hidden p-8">
      <div className="flex login-content rounded-2xl overflow-hidden h-full">
        {/* Left Side: Login Form */}
        <div className="flex items-center  flex-1 justify-center bg-blue-800">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-96 transition-all transform  hover:shadow-2xl">
            <h3 className="text-2xl font-semibold text-center text-gray-700 mb-6">
              Login to your account
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-600"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              >
                Login
              </button>
            </form>

            {/* Display error message if there's an error */}
            {error && (
              <div className="mt-4 text-center text-red-500 text-sm">
                <p>{error}</p>
              </div>
            )}

            {/* Display debug info if available */}
            {debugInfo && (
              <div className="mt-6 text-center text-gray-500 text-xs">
                <p>{debugInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quote */}
        <div className="flex items-center justify-center flex-col bg-gray-950 flex-1">
          <h2 className="text-white">
            One Stop Solution for all your Restaurant Needs!
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Login;
