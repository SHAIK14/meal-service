// src/components/SessionAuthModal.jsx
import React, { useState } from "react";
import {
  FaTimes,
  FaLock,
  FaPhone,
  FaExclamationTriangle,
} from "react-icons/fa";
import { validateSessionAccess } from "../utils/api";

const SessionAuthModal = ({ isOpen, onClose, sessionId, onAuthSuccess }) => {
  const [authMethod, setAuthMethod] = useState("pin"); // 'pin' or 'phone'
  const [pin, setPin] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available country codes
  const countryCodes = [
    { code: "+966", country: "Saudi Arabia" },
    { code: "+971", country: "UAE" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let validationData = { sessionId };
      console.log("Starting session authentication for session ID:", sessionId);

      if (authMethod === "pin") {
        if (!pin) {
          setError("Please enter the PIN");
          setIsLoading(false);
          return;
        }
        validationData.pin = pin;
        console.log("Authenticating with PIN:", pin);
      } else {
        if (!phoneNumber || phoneNumber.length !== 9) {
          setError("Please enter a valid 9-digit phone number");
          setIsLoading(false);
          return;
        }
        // Send just the 9-digit number without country code
        validationData.phoneNumber = phoneNumber;
        console.log("Authenticating with phone number:", phoneNumber);
      }

      const response = await validateSessionAccess(
        sessionId,
        authMethod === "pin" ? pin : null,
        authMethod === "phone" ? phoneNumber : null
      );

      console.log("Authentication response:", response);

      if (response.success) {
        console.log(
          "Authentication successful, session data:",
          response.session
        );

        // Check for PIN in response
        if (!response.session.pin) {
          console.warn("Warning: Session response is missing PIN");
        }

        // Save authentication state to localStorage
        localStorage.setItem(
          `session_${sessionId}`,
          JSON.stringify({
            authenticated: true,
            pin: response.session.pin,
          })
        );

        onAuthSuccess(response.session);
      } else {
        console.error("Authentication failed:", response.message);
        setError(response.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone number input to ensure only digits are entered
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Only allow digits
    const digits = input.replace(/\D/g, "");
    // Limit to 9 digits
    const limitedDigits = digits.slice(0, 9);
    setPhoneNumber(limitedDigits);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Removed onClick to prevent closing on background click */}
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>

      <div className="bg-white rounded-lg w-full max-w-md p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Session Authentication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-600 mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 text-sm font-bold">
                Authentication Required
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                This table has an active session. Please authenticate to access
                it.
              </p>
              <p className="text-red-600 text-xs mt-2 font-medium">
                If you cancel without authenticating, you will be redirected
                away.
              </p>
            </div>
          </div>
        </div>

        {/* Auth method selector */}
        <div className="flex mb-4 border rounded-lg overflow-hidden">
          <button
            className={`flex-1 py-2 px-4 ${
              authMethod === "pin"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setAuthMethod("pin")}
          >
            <FaLock className="inline mr-2" />
            Use PIN
          </button>
          <button
            className={`flex-1 py-2 px-4 ${
              authMethod === "phone"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setAuthMethod("phone")}
          >
            <FaPhone className="inline mr-2" />
            Use Phone
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {authMethod === "pin" ? (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Enter 4-digit PIN
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest"
                placeholder="0000"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the PIN you were given when the session started
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Enter Phone Number
              </label>
              <div className="flex">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  disabled
                >
                  {countryCodes.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.code} ({cc.country})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="flex-1 px-3 py-2 border border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="9-digit number"
                  maxLength={9}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the 9-digit phone number used during booking (without
                country code)
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isLoading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionAuthModal;
