// src/components/BookingModal.jsx - Updated version with fixed phone validation
import React, { useState } from "react";
import { FaTimes, FaInfoCircle } from "react-icons/fa";
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
    if (!phone) return false; // Phone is now required

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

    // Phone is now required and validate format
    if (!phoneNumber) {
      setError("Phone number is required");
      return;
    }

    // Make sure the phone number is exactly 9 digits
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
    if (cleanedPhoneNumber.length !== 9) {
      setError(
        "Please enter a valid 9-digit phone number without leading zeros"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    // Combine country code and phone for complete number
    const fullPhoneNumber = `${countryCode}${cleanedPhoneNumber}`;

    try {
      const response = await startSession(pincode, tableName, {
        customerName,
        customerPhone: cleanedPhoneNumber, // Send only the 9 digits without country code
        customerDob,
      });

      if (response.success) {
        // Save PIN to localStorage for this device
        if (response.session.pin) {
          localStorage.setItem(
            `session_${response.session.id}`,
            JSON.stringify({
              authenticated: true,
              pin: response.session.pin,
              phoneNumber: fullPhoneNumber,
            })
          );
        }

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
      <div className="fixed inset-0 bg-black bg-opacity-50" />

      <div className="bg-white rounded-lg w-full max-w-md p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Book Your Table</h2>
        </div>

        {/* Info box about authentication */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
            <p className="text-blue-800">
              Your phone number will be used to authenticate this session. A
              security PIN will be generated that you'll need if you reload the
              page or share access with others at your table.
            </p>
          </div>
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
            <label className="block text-gray-700 mb-2">Phone Number *</label>
            <div className="flex">
              {/* Country code dropdown - for display only */}
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
                onChange={handlePhoneChange}
                className="flex-1 px-3 py-2 border border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="9-digit number"
                required
                maxLength={9}
                inputMode="numeric"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Required - enter 9 digits without leading zeros or country code
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
