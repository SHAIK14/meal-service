import React, { useState } from "react";
import "../styles/Payment.css";

const PaymentPage = () => {
  const [paymentOptions, setPaymentOptions] = useState([
    { id: 1, name: "VISA", enabled: true },
    { id: 2, name: "Al Rajhi", enabled: true },
    { id: 3, name: "STC Pay", enabled: true },
  ]);
  const [newOption, setNewOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const availableOptions = [
    "PayPal",
    "MasterCard",
    "Apple Pay",
    "VISA",
    "MADA",
    "American Express",
    "Al Rajhi",
    "STC Pay",
  ];

  const handleToggle = (id) => {
    setPaymentOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  const handleAddOption = () => {
    if (newOption) {
      const optionExists = paymentOptions.some(
        (option) => option.name.toLowerCase() === newOption.toLowerCase()
      );

      if (optionExists) {
        setErrorMessage(`${newOption} is already added.`);
      } else {
        const id = paymentOptions.length + 1;
        setPaymentOptions([
          ...paymentOptions,
          { id, name: newOption, enabled: true },
        ]);
        setNewOption("");
        setErrorMessage("");
      }
    }
  };

  const handleRemoveOption = (id) => {
    setPaymentOptions(paymentOptions.filter((option) => option.id !== id));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl  font-semibold text-gray-800 mb-6">
        Manage Payment Options
      </h1>
      <div className="payment-options space-y-4">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            className="payment-item flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm transition-transform transform hover:scale-105"
          >
            <span className="text-lg font-medium text-gray-700">
              {option.name}
            </span>
            <div className="controls flex items-center space-x-4">
              <label className="switch relative inline-block w-14 h-8">
                <input
                  type="checkbox"
                  checked={option.enabled}
                  onChange={() => handleToggle(option.id)}
                  className="opacity-0 w-0 h-0"
                />
                <span className="slider absolute top-0 left-0 w-full h-full bg-gray-300 rounded-full transition-all duration-300 ease-in-out cursor-pointer">
                  <span
                    className={`dot absolute top-1 transition-all duration-300 ease-in-out ${
                      option.enabled ? "left-7 bg-green-500" : "left-1 bg-white"
                    } w-6 h-6 rounded-full shadow-md`}
                  ></span>
                </span>
              </label>
              <button
                className="remove-btn text-red-600 hover:text-white hover:bg-red-600 transition-all duration-300 px-4 py-2 rounded-lg shadow-md"
                onClick={() => handleRemoveOption(option.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="add-new-option mt-8 bg-gray-50 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Add New Payment Option
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ marginRight: "10px" }}
          >
            <option value="">Select an option</option>
            {availableOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddOption}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300"
          >
            Add Option
          </button>
        </div>

        {errorMessage && (
          <p className="error-message text-red-600 mt-4">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
