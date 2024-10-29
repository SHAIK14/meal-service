import React, { useState } from "react";
import "../styles/Vouchers.css";

const Vouchers = () => {
  const [showForm, setShowForm] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eligibleMembers, setEligibleMembers] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // Default to percentage
  const [discountValue, setDiscountValue] = useState(""); // State for discount value
  const [promoCodes, setPromoCodes] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPromoCode = {
      promoCode,
      startDate,
      endDate,
      eligibleMembers: parseInt(eligibleMembers),
      discountType,
      discountValue: parseFloat(discountValue), // Convert to a number
      isActive: true,
    };

    setPromoCodes([...promoCodes, newPromoCode]);
    setShowForm(false);
    setPromoCode("");
    setStartDate("");
    setEndDate("");
    setEligibleMembers("");
    setDiscountType("percentage");
    setDiscountValue("");
  };

  const togglePromoCode = (index) => {
    const updatedPromoCodes = [...promoCodes];
    updatedPromoCodes[index].isActive = !updatedPromoCodes[index].isActive;
    setPromoCodes(updatedPromoCodes);
  };

  const deletePromoCode = (index) => {
    const updatedPromoCodes = promoCodes.filter((_, i) => i !== index);
    setPromoCodes(updatedPromoCodes);
  };

  const handleAddPromoCodeClick = () => {
    setShowForm(true);
  };

  return (
    <div className="vouchers-page">
      <h1>Discount Vouchers</h1>

      {!showForm && (
        <button
          className="add-promo-btn global-btn"
          onClick={handleAddPromoCodeClick}
        >
          Add Promo Code
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="voucher-form">
          <div className="form-group">
            <label htmlFor="promoCode">Promo Code</label>
            <input
              type="text"
              id="promoCode"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter Promo Code"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eligibleMembers">Number of Members Eligible</label>
            <input
              type="number"
              id="eligibleMembers"
              value={eligibleMembers}
              onChange={(e) => setEligibleMembers(e.target.value)}
              placeholder="Enter number of members"
              min="1"
              required
            />
          </div>

          {/* Radio buttons for Discount Type */}
          <div className="discount-type-radio">
            <label>Discount Type</label>
            <div className="radio-inputs">
              <label>Percentage</label>
              <input
                type="radio"
                name="discountType"
                value="percentage"
                checked={discountType === "percentage"}
                onChange={() => setDiscountType("percentage")}
              />{" "}
            </div>
            <div className="radio-inputs">
              <label>Flat Discount</label>
              <input
                type="radio"
                name="discountType"
                value="flat"
                checked={discountType === "flat"}
                onChange={() => setDiscountType("flat")}
              />
            </div>
          </div>

          {/* Conditional input field for Discount Value */}
          <div className="discount-type-container">
            <label htmlFor="discountValue">
              {discountType === "percentage"
                ? "Percentage Discount (%)"
                : "Flat Discount (SAR)"}
            </label>
            <input
              type="number"
              id="discountValue"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={
                discountType === "percentage"
                  ? "Enter Percentage"
                  : "Enter Flat Discount"
              }
              min="0"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Voucher
          </button>
        </form>
      )}

      {promoCodes.length > 0 && (
        <div className="promo-codes-list">
          <h2>Active Promo Codes</h2>
          <ul>
            {promoCodes.map((promo, index) => (
              <li key={index} className="promo-code-item">
                <span>
                  {promo.promoCode} - Valid from {promo.startDate} to{" "}
                  {promo.endDate} - Eligible Members: {promo.eligibleMembers} -{" "}
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}%`
                    : `${promo.discountValue} (flat)`}{" "}
                  Discount
                </span>
                <div className="actions">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={promo.isActive}
                      onChange={() => togglePromoCode(index)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <button
                    className="delete-btn"
                    onClick={() => deletePromoCode(index)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {promoCodes.length === 0 && !showForm && <p>No promo codes available</p>}
    </div>
  );
};

export default Vouchers;
