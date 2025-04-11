/* eslint-disable react/prop-types */
// src/components/BookingModal.jsx
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { startSession } from "../utils/api";

const BookingModal = ({ isOpen, pincode, tableName, onSessionStarted }) => {
  const [customerName, setCustomerName] = useState("");
  const [countryCode, setCountryCode] = useState("+966"); // Default to Saudi Arabia
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerDob, setCustomerDob] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available country codes - focus on Saudi and UAE
  const countryCodes = [
    { code: "+966", country: "Saudi Arabia" },
    { code: "+971", country: "UAE" },
  ];

  // Phone validation for local number
  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional

    // Just validate the number has 9 digits (standard for Saudi/UAE mobile numbers)
    const regex = /^[0-9]{9}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Name is required
    if (!customerName.trim()) {
      setError("Name is required");
      return;
    }

    // Phone is optional but validate format if provided
    if (phoneNumber && !validatePhone(phoneNumber)) {
      setError("Please enter a valid 9-digit phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Combine country code and phone for complete number
    const fullPhoneNumber = phoneNumber ? `${countryCode}${phoneNumber}` : "";

    try {
      const response = await startSession(pincode, tableName, {
        customerName,
        customerPhone: fullPhoneNumber,
        customerDob,
      });

      if (response.success) {
        onSessionStarted(response.session);
      } else {
        setError(response.message || "Failed to book table");
      }
    } catch (err) {
      setError("Failed to book table. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" />

      <div className="bg-white rounded-lg w-full max-w-md p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Book Your Table</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <div className="flex">
              {/* Country code dropdown */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              >
                {countryCodes.map((cc) => (
                  <option key={cc.code} value={cc.code}>
                    {cc.code} ({cc.country})
                  </option>
                ))}
              </select>

              {/* Phone number input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-2 border border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="9-digit number"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optional - enter 9 digits
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={customerDob}
              onChange={(e) => setCustomerDob(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">Optional</p>
          </div>

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
            {isLoading ? "Processing..." : "Book Table"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
