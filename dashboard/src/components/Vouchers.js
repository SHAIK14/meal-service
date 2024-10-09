import React, { useState } from "react";
import "../styles/Vouchers.css";

const Vouchers = () => {
  // State variables
  const [showForm, setShowForm] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eligibleMembers, setEligibleMembers] = useState("");
  const [promoCodes, setPromoCodes] = useState([]);

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split("T")[0];

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Add new promo code to the list of promo codes
    const newPromoCode = {
      promoCode,
      startDate,
      endDate,
      eligibleMembers: parseInt(eligibleMembers),
      isActive: true,
    };

    setPromoCodes([...promoCodes, newPromoCode]);
    setShowForm(false);

    setPromoCode("");
    setStartDate("");
    setEndDate("");
    setEligibleMembers("");
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
              min={today} // Set minimum date to today
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
              min={today} // Set minimum date to today
              required
            />
          </div>

          {/* New field for Number of Members Eligible */}
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

          <button type="submit" className="submit-btn">
            Create Voucher
          </button>
        </form>
      )}

      {/* Display list of promo codes */}
      {promoCodes.length > 0 && (
        <div className="promo-codes-list">
          <h2>Active Promo Codes</h2>
          <ul>
            {promoCodes.map((promo, index) => (
              <li key={index} className="promo-code-item">
                <span>
                  {promo.promoCode} - Valid from {promo.startDate} to{" "}
                  {promo.endDate} - Eligible Members: {promo.eligibleMembers}
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

      {promoCodes.length === 0 && !showForm && (
        <p>No promo codes available</p> // Message when no promo codes are available
      )}
    </div>
  );
};

export default Vouchers;
