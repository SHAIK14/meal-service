import React, { useState, useEffect } from "react";
import {
  createVoucher,
  getAllVouchers,
  toggleVoucherStatus,
  deleteVoucher,
} from "../utils/api.js";
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
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <div className="w-8 h-8 border-4 border-red-500 border-solid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen overflow-auto p-6">
      <div className=" mx-auto bg-gray-100 p-6 h-full  ">
        {/* Header */}
        <div className="   border-b border-gray-100  flex justify-between items-center">
          <h1 className="text-2xl m-0 font-semibold text-gray-800">
            Discount Vouchers
          </h1>

          {error && (
            <div className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {!showForm && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2  transition-all duration-200 flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Promo Code
            </button>
          )}
        </div>

        {/* Form Section */}
        <div className="p-6">
          {showForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Create New Promo Code
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Promo Code */}
                  <div className="space-y-2">
                    <label
                      htmlFor="promoCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Promo Code
                    </label>
                    <input
                      type="text"
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter Promo Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Eligible Members */}
                  <div className="space-y-2">
                    <label
                      htmlFor="eligibleMembers"
                      className="block text-sm font-medium text-gray-700"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={today}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || today}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Discount Type and Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <span className="block text-sm font-medium text-gray-700">
                      Discount Type
                    </span>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="discountType"
                          value="percentage"
                          checked={discountType === "percentage"}
                          onChange={(e) => setDiscountType(e.target.value)}
                          className="form-radio h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-gray-700">Percentage</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="discountType"
                          value="flat"
                          checked={discountType === "flat"}
                          onChange={(e) => setDiscountType(e.target.value)}
                          className="form-radio h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-gray-700">Flat</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="discountValue"
                      className="block text-sm font-medium text-gray-700"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Max Threshold (Conditional) */}
                {discountType === "percentage" && (
                  <div className="space-y-2">
                    <label
                      htmlFor="maxThreshold"
                      className="block text-sm font-medium text-gray-700"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      "Create Promo Code"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Promo Code Listing */}
          {promoCodes.length === 0 && !showForm ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 12H4M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-gray-500 text-lg">No promo codes available</p>
              <button
                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                onClick={() => setShowForm(true)}
              >
                Create Your First Promo Code
              </button>
            </div>
          ) : (
            promoCodes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Active Promo Codes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {promoCodes.map((promo) => {
                    const status = getVoucherStatus(
                      promo.startDate,
                      promo.endDate
                    );
                    return (
                      <div
                        key={promo._id}
                        className={`bg-white rounded-xl border overflow-hidden shadow-sm ${
                          status.status === "active"
                            ? "border-green-200"
                            : status.status === "scheduled"
                            ? "border-blue-200"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="py-4 px-5 flex justify-between items-center border-b border-gray-100">
                          <h3 className="font-bold text-lg text-gray-800">
                            {promo.promoCode}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {/* Fixed Toggle Button */}
                            <div className="relative inline-block w-12 mr-2 align-middle select-none">
                              <input
                                type="checkbox"
                                id={`toggle-${promo._id}`}
                                checked={promo.isActive}
                                onChange={() => togglePromoCode(promo._id)}
                                disabled={
                                  loading || status.status === "expired"
                                }
                                className="sr-only"
                              />
                              <label
                                htmlFor={`toggle-${promo._id}`}
                                className={`
                                block overflow-hidden h-6 w-12 rounded-full cursor-pointer relative
                                ${
                                  promo.isActive &&
                                  !(loading || status.status === "expired")
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }
                                ${
                                  loading || status.status === "expired"
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }
                              `}
                              >
                                <span
                                  className={`
                                  absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ease-in-out
                                  ${
                                    promo.isActive &&
                                    !(loading || status.status === "expired")
                                      ? "translate-x-6"
                                      : "translate-x-0"
                                  }
                                `}
                                />
                              </label>
                            </div>

                            <button
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() => handleDeletePromoCode(promo._id)}
                              disabled={loading}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Rest of the promo card content */}
                        <div className="p-5">
                          {/* Status badge */}
                          <div className="mb-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                status.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : status.status === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {status.text}
                            </span>
                          </div>

                          {/* Promo details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Valid Period:
                              </span>
                              <span className="text-gray-700 font-medium">
                                {new Date(promo.startDate).toLocaleDateString()}{" "}
                                - {new Date(promo.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Eligible Members:
                              </span>
                              <span className="text-gray-700 font-medium">
                                {promo.eligibleMembers}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Used:</span>
                              <span className="text-gray-700 font-medium">
                                {promo.usedCount || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Discount:</span>
                              <span className="text-gray-700 font-medium">
                                {promo.discountType === "percentage"
                                  ? `${promo.discountValue}% (Max: ${promo.maxThreshold} SAR)`
                                  : `${promo.discountValue} SAR`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
