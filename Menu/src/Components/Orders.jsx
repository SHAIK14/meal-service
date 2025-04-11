// src/components/Orders.jsx
import React, { useEffect, useState } from "react";
import { useDining } from "../contexts/DiningContext";
import { requestPayment } from "../utils/api";

const Orders = () => {
  const { sessionDetails, updateSessionDetails, orders, socket, isConnected } =
    useDining();
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);

  // Log connection status changes for debugging
  useEffect(() => {
    console.log("Socket connection status in Orders:", isConnected);
  }, [isConnected]);

  // Listen for payment confirmation from socket
  useEffect(() => {
    if (socket) {
      const handlePaymentConfirmation = (data) => {
        console.log("Payment request confirmation received:", data);
        if (data.sessionId === sessionDetails?.id) {
          // Update session details with payment requested status
          updateSessionDetails({
            ...sessionDetails,
            paymentRequested: true,
          });
        }
      };

      socket.on("payment_request_confirmed", handlePaymentConfirmation);

      return () => {
        socket.off("payment_request_confirmed", handlePaymentConfirmation);
      };
    }
  }, [socket, sessionDetails?.id, updateSessionDetails]);

  const handleRequestPayment = async () => {
    try {
      if (!sessionDetails?.id) return;

      setIsRequestingPayment(true);

      // First update the UI immediately (optimistic update)
      updateSessionDetails({
        ...sessionDetails,
        paymentRequested: true,
      });

      // Then send the request to the server
      await requestPayment(sessionDetails.id);
      console.log("Payment request sent successfully");

      // Update will be confirmed by socket event
    } catch (error) {
      console.error("Error requesting payment:", error);
      // Revert UI update if request fails
      updateSessionDetails({
        ...sessionDetails,
        paymentRequested: false,
      });
      alert("Failed to request payment. Please try again.");
    } finally {
      setIsRequestingPayment(false);
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
      {/* Socket Connection Indicator (for debugging) */}
      <div
        className={`text-sm mb-2 ${
          isConnected ? "text-green-500" : "text-red-500"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

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
              disabled={isRequestingPayment}
              className={`bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 ${
                isRequestingPayment ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isRequestingPayment ? "Processing..." : "Request Payment"}
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
