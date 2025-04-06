import React, { useState } from "react";
import { TrashIcon } from "lucide-react";

const PaymentPage = () => {
  const [paymentOptions, setPaymentOptions] = useState([
    { id: 1, name: "VISA", enabled: true },
    { id: 2, name: "Al Rajhi", enabled: true },
    { id: 3, name: "STC Pay", enabled: true },
  ]);
  const [newOption, setNewOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Filter out options that have already been added
  const filteredAvailableOptions = [
    "PayPal",
    "MasterCard",
    "Apple Pay",
    "VISA",
    "MADA",
    "American Express",
    "Al Rajhi",
    "STC Pay",
  ].filter(
    (option) =>
      !paymentOptions.some(
        (po) => po.name.toLowerCase() === option.toLowerCase()
      )
  );

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
        const id =
          Math.max(...paymentOptions.map((option) => option.id), 0) + 1;
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
    <div className="bg-white p-6">
      <div className=" mx-auto p-6 bg-gray-100">
        <h1 className="text-2xl font-semibold text-left   text-gray-800 ">
          Manage Payment Options
        </h1>
        <div className="space-y-2 h-[300px] overflow-y-scroll  mb-8">
          {paymentOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow transition"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-800">{option.name}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    option.enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {option.enabled ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={option.enabled}
                    onChange={() => handleToggle(option.id)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  className="flex items-center justify-center p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                  aria-label="Remove payment option"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            </div>
          ))}

          {paymentOptions.length === 0 && (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              No payment options added yet.
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-xl font-medium mb-4 text-gray-700">
            Add New Payment Option
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="">Select an option</option>
              {filteredAvailableOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddOption}
              className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Add Option
            </button>
          </div>

          {errorMessage && (
            <p className="mt-3 text-red-500 text-sm">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
