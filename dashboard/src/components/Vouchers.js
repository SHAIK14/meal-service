import React, { useState, useEffect } from "react";
import {
  createVoucher,
  getAllVouchers,
  toggleVoucherStatus,
  deleteVoucher,
} from "../utils/api.js";
import { FaTrash } from "react-icons/fa";
// import "../styles/Vouchers.css";

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
    <div className="p-8 h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-start m-0 p-0">
          {" "}
          Discount Vouchers
        </h1>

        {error && <div className="error-message">{error}</div>}

        {!showForm && (
          <button
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-green-500 text-sm font-semibold text-black hover:text-white transition-all duration-300"
            onClick={() => setShowForm(true)}
          >
            Create Promo Code
          </button>
        )}
      </div>
      <div className="mt-8 ">
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-xl max-w-lg mx-auto transition-transform transform hover:scale-105 duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Create Promo Code
            </h2>

            {/* Promo Code */}
            <div className="form-group mb-6">
              <label
                htmlFor="promoCode"
                className="text-lg font-medium text-gray-700 mb-2 block"
              >
                Promo Code
              </label>
              <input
                type="text"
                id="promoCode"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter Promo Code"
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dates Section */}
            <div className="form-group mb-6 grid grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="date-input">
                <label
                  htmlFor="startDate"
                  className="text-lg font-medium text-gray-700 mb-2 block"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div className="date-input">
                <label
                  htmlFor="endDate"
                  className="text-lg font-medium text-gray-700 mb-2 block"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Eligible Members */}
            <div className="form-group mb-6">
              <label
                htmlFor="eligibleMembers"
                className="text-lg font-medium text-gray-700 mb-2 block"
              >
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Discount Type */}
            <div className="discount-type-section mb-6">
              <label className="text-lg font-medium text-gray-700 mb-4 block">
                Discount Type
              </label>
              <div className="discount-type-options space-x-6">
                <label className="radio-label flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={discountType === "percentage"}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="form-radio h-5 w-5 text-blue-500"
                  />
                  <span className="ml-2 text-lg text-gray-700">Percentage</span>
                </label>
                <label className="radio-label flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="flat"
                    checked={discountType === "flat"}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="form-radio h-5 w-5 text-blue-500"
                  />
                  <span className="ml-2 text-lg text-gray-700">Flat</span>
                </label>
              </div>
            </div>

            {/* Discount Value */}
            <div className="form-group mb-6">
              <label
                htmlFor="discountValue"
                className="text-lg font-medium text-gray-700 mb-2 block"
              >
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Discount Threshold for Percentage */}
            {discountType === "percentage" && (
              <div className="form-group mb-6">
                <label
                  htmlFor="maxThreshold"
                  className="text-lg font-medium text-gray-700 mb-2 block"
                >
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="form-buttons flex justify-between items-center">
              <button
                type="submit"
                className="submit-btn bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                className="cancel-btn bg-gray-300 text-gray-700 py-2 px-6 rounded-lg shadow-md hover:bg-gray-400 transition-all duration-300"
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
          <div className="promo-codes-list p-8 rounded-xl ">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex flex-start">
              Promo Codes
            </h2>
            <div className="promo-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {promoCodes.map((promo) => {
                const status = getVoucherStatus(promo.startDate, promo.endDate);
                return (
                  <div
                    key={promo._id}
                    className={`promo-card bg-white p-6 rounded-lg border transform transition duration-300 hover:scale-105 relative group ${
                      status.status === "expired" ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="promo-header flex gap-4 items-center mb-4">
                      <h3 className="text-xl p-0 m-0 font-semibold text-gray-800">
                        {promo.promoCode}
                      </h3>
                      <div className="promo-actions flex items-center space-x-4">
                        <label className="switch relative inline-block w-16 h-9">
                          <input
                            type="checkbox"
                            checked={promo.isActive}
                            onChange={() => togglePromoCode(promo._id)}
                            disabled={loading || status.status === "expired"}
                            className="opacity-0 w-0 h-0"
                          />
                          <span className="slider  absolute top-0 left-0 w-full h-full bg-gray-300 rounded-full transition-all duration-100 ease-in-out cursor-pointer">
                            <span
                              className={`dot absolute top-1 transition-all duration-300 ease-in-out  ${
                                promo.isActive
                                  ? "left-7 bg-green-500"
                                  : "left-1 bg-white"
                              } `}
                            ></span>
                          </span>
                        </label>

                        <button
                          className="delete-btn absolute top-2 right-2 hidden group-hover:block text-red-500 text-2xl"
                          onClick={() => handleDeletePromoCode(promo._id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="promo-details  text-gray-600 space-y-2">
                      <p>
                        <span className="font-medium text-gray-800">
                          Valid:
                        </span>{" "}
                        {new Date(promo.startDate).toLocaleDateString()} to{" "}
                        {new Date(promo.endDate).toLocaleDateString()}
                      </p>
                      <p
                        className={`status-tag font-medium text-sm ${
                          status.status === "expired"
                            ? "text-gray-500"
                            : "text-green-600"
                        }`}
                      >
                        {status.text}
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">
                          Eligible Members:
                        </span>{" "}
                        {promo.eligibleMembers}
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Used:</span>{" "}
                        {promo.usedCount || 0}
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">
                          Discount:
                        </span>{" "}
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
