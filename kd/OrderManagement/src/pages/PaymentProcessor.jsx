// src/components/dining/PaymentProcessor.jsx
import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCreditCard,
  FaMoneyBill,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { processPayment } from "../utils/api";

function PaymentProcessor({
  selectedTable,
  tableSession,
  onClose,
  onPaymentComplete,
}) {
  // Payment state
  const [payments, setPayments] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receiptNumber, setReceiptNumber] = useState("");

  // Excess allocation state
  const [excessAllocations, setExcessAllocations] = useState([]);
  const [allocationType, setAllocationType] = useState("tip");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [allocationRemark, setAllocationRemark] = useState("");

  // Calculation state
  const [totalBill, setTotalBill] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [excessAmount, setExcessAmount] = useState(0);
  const [unallocatedExcess, setUnallocatedExcess] = useState(0);

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showExcessForm, setShowExcessForm] = useState(false);

  // Initialize total bill amount
  useEffect(() => {
    if (tableSession?.session) {
      const billAmount = tableSession.session.totalAmount || 0;
      setTotalBill(billAmount);
      setRemainingBalance(billAmount);
    }
  }, [tableSession]);

  // Recalculate totals when payments or allocations change
  useEffect(() => {
    const paid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const allocated = excessAllocations.reduce(
      (sum, a) => sum + parseFloat(a.amount),
      0
    );

    setTotalPaid(paid);
    setRemainingBalance(totalBill - paid);
    setExcessAmount(paid > totalBill ? paid - totalBill : 0);
    setUnallocatedExcess(paid > totalBill ? paid - totalBill - allocated : 0);

    // Show excess form if there's unallocated excess
    setShowExcessForm(paid > totalBill && paid - totalBill - allocated > 0);
  }, [payments, excessAllocations, totalBill]);

  // Add a payment
  const handleAddPayment = () => {
    // Validate
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (
      paymentMethod === "card" &&
      (!receiptNumber || receiptNumber.length !== 4)
    ) {
      setError("Please enter a valid 4-digit receipt number for card payment");
      return;
    }

    // Create payment object
    const payment = {
      id: Date.now().toString(), // Temporary ID for client-side tracking
      method: paymentMethod,
      amount: parseFloat(paymentAmount),
      timestamp: new Date(),
    };

    if (paymentMethod === "card") {
      payment.receiptNumber = receiptNumber;
    }

    // Add to payments list
    setPayments([...payments, payment]);

    // Reset form
    setPaymentAmount("");
    setReceiptNumber("");
    setError(null);
  };

  // Remove a payment
  const handleRemovePayment = (paymentId) => {
    setPayments(payments.filter((p) => p.id !== paymentId));
  };

  // Add excess allocation
  const handleAddAllocation = () => {
    // Validate
    if (!allocationAmount || parseFloat(allocationAmount) <= 0) {
      setError("Please enter a valid allocation amount");
      return;
    }

    if (parseFloat(allocationAmount) > unallocatedExcess) {
      setError(
        `Cannot allocate more than the unallocated excess (${unallocatedExcess.toFixed(
          2
        )} SAR)`
      );
      return;
    }

    // Create allocation object
    const allocation = {
      id: Date.now().toString(), // Temporary ID for client-side tracking
      type: allocationType,
      amount: parseFloat(allocationAmount),
      remark: allocationRemark || "",
    };

    // Add to allocations list
    setExcessAllocations([...excessAllocations, allocation]);

    // Reset form
    setAllocationAmount("");
    setAllocationRemark("");
    setError(null);
  };

  // Remove an allocation
  const handleRemoveAllocation = (allocationId) => {
    setExcessAllocations(
      excessAllocations.filter((a) => a.id !== allocationId)
    );
  };

  // Process payment
  const handleProcessPayment = async () => {
    // Check if payments cover bill amount
    if (totalPaid < totalBill) {
      setError(
        `Payment amount (${totalPaid.toFixed(
          2
        )} SAR) is less than the bill amount (${totalBill.toFixed(2)} SAR)`
      );
      return;
    }

    // Check if all excess is allocated
    if (unallocatedExcess > 0.01) {
      // Small tolerance for floating point
      setError(
        `Please allocate all excess payment (${unallocatedExcess.toFixed(
          2
        )} SAR remaining)`
      );
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare payment data
      const paymentData = {
        payments: payments.map(({ id, ...payment }) => payment), // Remove client-side IDs
        excessAllocation: excessAllocations.map(
          ({ id, ...allocation }) => allocation
        ), // Remove client-side IDs
      };

      // Send to server
      const response = await processPayment(
        tableSession.session._id,
        paymentData
      );

      if (response.success) {
        onPaymentComplete();
      } else {
        setError(response.message || "Failed to process payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Error processing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden transform transition-all my-8">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Process Payment - {selectedTable.name}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Bill Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap justify-between mb-2">
              <span className="text-gray-700 font-medium">Total Bill:</span>
              <span className="text-gray-900 font-bold">
                {totalBill.toFixed(2)} SAR
              </span>
            </div>
            <div className="flex flex-wrap justify-between mb-2">
              {/* <span className="text-gray-700 font-medium"></span> */}
              <span className="text-gray-700 font-medium">Total Paid:</span>
              <span
                className={`font-bold ${
                  totalPaid >= totalBill ? "text-green-600" : "text-gray-900"
                }`}
              >
                {totalPaid.toFixed(2)} SAR
              </span>
            </div>
            <div className="flex flex-wrap justify-between">
              {remainingBalance > 0 ? (
                <>
                  <span className="text-gray-700 font-medium">
                    Remaining Balance:
                  </span>
                  <span className="text-red-600 font-bold">
                    {remainingBalance.toFixed(2)} SAR
                  </span>
                </>
              ) : excessAmount > 0 ? (
                <>
                  <span className="text-gray-700 font-medium">
                    Excess Payment:
                  </span>
                  <span className="text-green-600 font-bold">
                    {excessAmount.toFixed(2)} SAR
                  </span>
                </>
              ) : (
                <>
                  <span className="text-gray-700 font-medium">Balance:</span>
                  <span className="text-green-600 font-bold">0.00 SAR</span>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Payment List */}
          {payments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Payments</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt #
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {payment.method === "cash" ? (
                              <FaMoneyBill className="text-green-500 mr-2" />
                            ) : (
                              <FaCreditCard className="text-blue-500 mr-2" />
                            )}
                            <span className="font-medium text-gray-900">
                              {payment.method === "cash" ? "Cash" : "Card"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-900">
                          {payment.amount.toFixed(2)} SAR
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-gray-500">
                          {payment.receiptNumber || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleRemovePayment(payment.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Excess Allocations List */}
          {excessAllocations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Excess Allocations</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remark
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {excessAllocations.map((allocation) => (
                      <tr key={allocation.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${allocation.type === 'tip' ? 'bg-green-100 text-green-800' : ''} 
                            ${allocation.type === 'change' ? 'bg-blue-100 text-blue-800' : ''}
                            ${allocation.type === 'advance' ? 'bg-purple-100 text-purple-800' : ''}
                            ${allocation.type === 'custom' ? 'bg-gray-100 text-gray-800' : ''}
                          "
                          >
                            {allocation.type.charAt(0).toUpperCase() +
                              allocation.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-900">
                          {allocation.amount.toFixed(2)} SAR
                        </td>
                        <td className="px-4 py-3 text-gray-500 truncate max-w-xs">
                          {allocation.remark || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() =>
                              handleRemoveAllocation(allocation.id)
                            }
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Payment Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">Add Payment</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (SAR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                      paymentMethod === "cash"
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : "bg-white border border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <FaMoneyBill />
                    Cash
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                      paymentMethod === "card"
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                        : "bg-white border border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <FaCreditCard />
                    Card
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Number (only for card payments) */}
            {paymentMethod === "card" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Number (Last 4 digits)
                </label>
                <input
                  type="text"
                  maxLength="4"
                  value={receiptNumber}
                  onChange={(e) =>
                    setReceiptNumber(
                      e.target.value.replace(/[^0-9]/g, "").slice(0, 4)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 4-digit receipt number"
                />
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 flex items-center justify-center gap-2 transition-colors"
              >
                <FaPlus />
                Add Payment
              </button>
            </div>
          </div>

          {/* Excess Allocation Form (only shown when there's excess to allocate) */}
          {showExcessForm && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
              <h3 className="text-lg font-semibold mb-3">
                Allocate Excess Payment
              </h3>
              <div className="text-yellow-700 mb-3">
                Unallocated excess:{" "}
                <span className="font-bold">
                  {unallocatedExcess.toFixed(2)} SAR
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (SAR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={unallocatedExcess}
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Max ${unallocatedExcess.toFixed(2)}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocation Type
                  </label>
                  <select
                    value={allocationType}
                    onChange={(e) => setAllocationType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="tip">Tip</option>
                    <option value="change">Change</option>
                    <option value="advance">Advance Payment</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Remark field (optional) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark (Optional)
                </label>
                <input
                  type="text"
                  value={allocationRemark}
                  onChange={(e) => setAllocationRemark(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter remark"
                />
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddAllocation}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white rounded-md py-2 px-4 flex items-center justify-center gap-2 transition-colors"
                >
                  <FaPlus />
                  Add Allocation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={
              isProcessing || remainingBalance > 0 || unallocatedExcess > 0.01
            }
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
              isProcessing || remainingBalance > 0 || unallocatedExcess > 0.01
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isProcessing ? "Processing..." : "Complete Payment"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentProcessor;
