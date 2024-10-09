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
    <div>
      <h1>Manage Payment Options</h1>
      <div className="payment-options">
        {paymentOptions.map((option) => (
          <div key={option.id} className="payment-item">
            <span>{option.name}</span>
            <div className="controls">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={option.enabled}
                  onChange={() => handleToggle(option.id)}
                />
                <span className="slider round"></span>
              </label>
              <button
                className="remove-btn"
                onClick={() => handleRemoveOption(option.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="add-new-option">
        <h3>Add New Payment Option</h3>
        <select
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="">Select an option</option>
          {availableOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button onClick={handleAddOption}>Add Option</button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default PaymentPage;
