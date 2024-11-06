import React, { useState, useEffect } from "react";
import {
  createVoucher,
  getAllVouchers,
  toggleVoucherStatus,
  deleteVoucher,
} from "../utils/api.js";
import "../styles/Vouchers.css";

const Vouchers = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eligibleMembers, setEligibleMembers] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxThreshold, setMaxThreshold] = useState("");
  const [promoCodes, setPromoCodes] = useState([]);

  // Get current date and time
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  useEffect(() => {
    fetchVouchers();
    // Refresh vouchers every minute to update status
    const interval = setInterval(fetchVouchers, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    const response = await getAllVouchers();
    if (response.success) {
      setPromoCodes(response.data.data);
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  const getVoucherStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
      return {
        status: "upcoming",
        text: `Starts in ${days} day${days !== 1 ? "s" : ""}`,
      };
    }

    if (now > end) {
      return { status: "expired", text: "Expired" };
    }

    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return {
      status: "active",
      text: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Combine date and time for precise timestamps
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // Set end time to end of day

    const voucherData = {
      promoCode,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      eligibleMembers: parseInt(eligibleMembers),
      discountType,
      discountValue: parseFloat(discountValue),
      maxThreshold:
        discountType === "percentage" ? parseFloat(maxThreshold) : null,
    };

    const response = await createVoucher(voucherData);

    if (response.success) {
      await fetchVouchers();
      setShowForm(false);
      resetForm();
    } else {
      setError(response.error);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setPromoCode("");
    setStartDate("");
    setEndDate("");
    setEligibleMembers("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMaxThreshold("");
    setError("");
  };

  const togglePromoCode = async (voucherId) => {
    setLoading(true);
    const response = await toggleVoucherStatus(voucherId);
    if (response.success) {
      await fetchVouchers();
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  const handleDeletePromoCode = async (voucherId) => {
    if (window.confirm("Are you sure you want to delete this promo code?")) {
      setLoading(true);
      const response = await deleteVoucher(voucherId);
      if (response.success) {
        await fetchVouchers();
      } else {
        setError(response.error);
      }
      setLoading(false);
    }
  };

  if (loading && promoCodes.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="vouchers-page">
      <h1>Discount Vouchers</h1>

      {error && <div className="error-message">{error}</div>}

      {!showForm && (
        <button
          className="add-promo-btn global-btn"
          onClick={() => setShowForm(true)}
        >
          Add Promo Code
        </button>
      )}

      <div className="voucher-container">
        {showForm && (
          <form onSubmit={handleSubmit} className="voucher-form">
            <div className="form-group">
              <label htmlFor="promoCode">Promo Code</label>
              <input
                type="text"
                id="promoCode"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter Promo Code"
                required
              />
            </div>

            <div className="form-group dates-group">
              <div className="date-input">
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

              <div className="date-input">
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
            </div>

            <div className="form-group">
              <label htmlFor="eligibleMembers">
                Number of Members Eligible
              </label>
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

            <div className="discount-type-section">
              <label>Discount Type</label>
              <div className="discount-type-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={discountType === "percentage"}
                    onChange={(e) => setDiscountType(e.target.value)}
                  />
                  Percentage
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="discountType"
                    value="flat"
                    checked={discountType === "flat"}
                    onChange={(e) => setDiscountType(e.target.value)}
                  />
                  Flat
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="discountValue">
                {discountType === "percentage"
                  ? "Percentage Discount"
                  : "Flat Discount (SAR)"}
              </label>
              <input
                type="number"
                id="discountValue"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={
                  discountType === "percentage"
                    ? "Enter percentage"
                    : "Enter amount"
                }
                min="0"
                max={discountType === "percentage" ? "100" : ""}
                required
              />
            </div>

            {discountType === "percentage" && (
              <div className="form-group">
                <label htmlFor="maxThreshold">
                  Maximum Discount Amount (SAR)
                </label>
                <input
                  type="number"
                  id="maxThreshold"
                  value={maxThreshold}
                  onChange={(e) => setMaxThreshold(e.target.value)}
                  placeholder="Enter maximum discount amount"
                  min="0"
                  required
                />
              </div>
            )}

            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {promoCodes.length > 0 && (
          <div className="promo-codes-list">
            <h2>Promo Codes</h2>
            <div className="promo-grid">
              {promoCodes.map((promo) => {
                const status = getVoucherStatus(promo.startDate, promo.endDate);
                return (
                  <div
                    key={promo._id}
                    className={`promo-card ${status.status}`}
                  >
                    <div className="promo-header">
                      <h3>{promo.promoCode}</h3>
                      <div className="promo-actions">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={promo.isActive}
                            onChange={() => togglePromoCode(promo._id)}
                            disabled={loading || status.status === "expired"}
                          />
                          <span className="slider round"></span>
                        </label>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeletePromoCode(promo._id)}
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="promo-details">
                      <p>
                        Valid: {new Date(promo.startDate).toLocaleDateString()}{" "}
                        to {new Date(promo.endDate).toLocaleDateString()}
                      </p>
                      <p className={`status-tag ${status.status}`}>
                        {status.text}
                      </p>
                      <p>Eligible Members: {promo.eligibleMembers}</p>
                      <p>Used: {promo.usedCount || 0}</p>
                      <p>
                        Discount:{" "}
                        {promo.discountType === "percentage"
                          ? `${promo.discountValue}% (Max: ${promo.maxThreshold} SAR)`
                          : `${promo.discountValue} SAR`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {promoCodes.length === 0 && !showForm && (
          <p className="no-codes">No promo codes available</p>
        )}
      </div>
    </div>
  );
};

export default Vouchers;
