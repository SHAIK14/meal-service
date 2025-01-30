// src/components/Orders.jsx
import React from "react";
import { useDining } from "../contexts/DiningContext";
import { requestPayment } from "../utils/api";

const Orders = () => {
  const { sessionDetails, orders } = useDining();

  const handleRequestPayment = async () => {
    try {
      if (!sessionDetails?.id) return;
      await requestPayment(sessionDetails.id);
      alert("Payment request sent successfully!");
    } catch (error) {
      console.error("Error requesting payment:", error);
      alert("Failed to request payment. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "accepted":
        return "text-blue-500";
      case "served":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-gray-500">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Session Total */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Total Amount</h2>
            <p className="text-2xl font-bold text-red-500">
              {sessionDetails?.totalAmount?.toFixed(2)} SAR
            </p>
          </div>
          {!sessionDetails?.paymentRequested && (
            <button
              onClick={handleRequestPayment}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            >
              Request Payment
            </button>
          )}
          {sessionDetails?.paymentRequested && (
            <div className="text-green-500 font-medium">Payment Requested</div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">
                {formatTime(order.createdAt)}
              </span>
              <span className={`font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={`${order._id}-${index}`}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {item.price} SAR
                    </p>
                  </div>
                  <p className="font-medium">
                    {(item.quantity * item.price).toFixed(2)} SAR
                  </p>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <span className="font-medium">Order Total:</span>
              <span className="font-bold text-lg">
                {order.totalAmount.toFixed(2)} SAR
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
