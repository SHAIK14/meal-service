// src/components/Orders.jsx
import React, { useEffect, useState } from "react";
import { useDining } from "../contexts/DiningContext";
import { requestPayment } from "../utils/api";

const Orders = () => {
  const {
    sessionDetails,
    updateSessionDetails,
    orders,
    updateOrders,
    socket,
    isConnected,
  } = useDining();
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);

  // Log connection status changes for debugging
  useEffect(() => {
    console.log("Socket connection status in Orders:", isConnected);
  }, [isConnected]);

  // Listen for socket events
  useEffect(() => {
    if (socket) {
      const handlePaymentConfirmation = (data) => {
        console.log("Payment request confirmation received:", data);
        if (data.sessionId === sessionDetails?.id) {
          updateSessionDetails({
            ...sessionDetails,
            paymentRequested: true,
          });
        }
      };

      // Handle order status updates
      const handleOrderStatusUpdate = (data) => {
        console.log("Order status update received:", data);

        // Map backend status to customer-friendly status
        let customerStatus = data.status;
        if (data.status === "admin_approved") customerStatus = "accepted";
        if (
          data.status === "in_preparation" ||
          data.status === "ready_for_pickup"
        )
          customerStatus = "preparing";

        // Update the orders immediately
        updateOrders(
          orders.map((order) =>
            order._id === data.orderId
              ? { ...order, status: customerStatus }
              : order
          )
        );
      };

      // Handle generic order updates - this is critical for updating the order total and items
      const handleOrderUpdated = (data) => {
        console.log("Order updated event received:", data);

        if (data.orderId) {
          const updatedOrders = orders.map((order) => {
            if (order._id === data.orderId) {
              // Create a new order object with all the updated properties
              const updatedOrder = { ...order };

              // Update totalAmount if provided
              if (data.totalAmount !== undefined) {
                updatedOrder.totalAmount = data.totalAmount;
              }

              // If item was updated, update the specific item
              if (data.itemUpdated && data.itemUpdated.index !== undefined) {
                const { index, actionType, quantity } = data.itemUpdated;
                const updatedItems = [...updatedOrder.items];

                if (updatedItems[index]) {
                  if (actionType === "cancel") {
                    updatedItems[index] = {
                      ...updatedItems[index],
                      cancelledQuantity:
                        (updatedItems[index].cancelledQuantity || 0) + quantity,
                    };
                  } else if (actionType === "return") {
                    updatedItems[index] = {
                      ...updatedItems[index],
                      returnedQuantity:
                        (updatedItems[index].returnedQuantity || 0) + quantity,
                    };
                  }
                  updatedOrder.items = updatedItems;
                }
              }

              return updatedOrder;
            }
            return order;
          });

          // Update orders state
          updateOrders(updatedOrders);

          // Update session total if provided
          if (data.sessionTotal !== undefined && sessionDetails) {
            updateSessionDetails({
              ...sessionDetails,
              totalAmount: data.sessionTotal,
            });
          }
        }
      };

      // Handle specific item cancellations
      const handleItemCancellation = (data) => {
        console.log("Item cancelled event received:", data);

        if (data.orderId && data.itemIndex !== undefined) {
          updateOrders(
            orders.map((order) => {
              if (order._id === data.orderId) {
                const updatedItems = [...order.items];

                if (updatedItems[data.itemIndex]) {
                  updatedItems[data.itemIndex] = {
                    ...updatedItems[data.itemIndex],
                    cancelledQuantity:
                      (updatedItems[data.itemIndex].cancelledQuantity || 0) +
                      data.quantity,
                  };
                }

                return {
                  ...order,
                  items: updatedItems,
                  totalAmount:
                    data.newOrderTotal !== undefined
                      ? data.newOrderTotal
                      : order.totalAmount,
                };
              }
              return order;
            })
          );

          // Also update session total
          if (data.newSessionTotal !== undefined && sessionDetails) {
            updateSessionDetails({
              ...sessionDetails,
              totalAmount: data.newSessionTotal,
            });
          }
        }
      };

      // Handle specific item returns
      const handleItemReturn = (data) => {
        console.log("Item returned event received:", data);

        if (data.orderId && data.itemIndex !== undefined) {
          updateOrders(
            orders.map((order) => {
              if (order._id === data.orderId) {
                const updatedItems = [...order.items];

                if (updatedItems[data.itemIndex]) {
                  updatedItems[data.itemIndex] = {
                    ...updatedItems[data.itemIndex],
                    returnedQuantity:
                      (updatedItems[data.itemIndex].returnedQuantity || 0) +
                      data.quantity,
                  };
                }

                return {
                  ...order,
                  items: updatedItems,
                  totalAmount:
                    data.newOrderTotal !== undefined
                      ? data.newOrderTotal
                      : order.totalAmount,
                };
              }
              return order;
            })
          );

          // Also update session total
          if (data.newSessionTotal !== undefined && sessionDetails) {
            updateSessionDetails({
              ...sessionDetails,
              totalAmount: data.newSessionTotal,
            });
          }
        }
      };

      socket.on("payment_request_confirmed", handlePaymentConfirmation);
      socket.on("order_status_updated", handleOrderStatusUpdate);
      socket.on("order_updated", handleOrderUpdated);
      socket.on("order_item_cancelled", handleItemCancellation);
      socket.on("order_item_returned", handleItemReturn);

      return () => {
        socket.off("payment_request_confirmed", handlePaymentConfirmation);
        socket.off("order_status_updated", handleOrderStatusUpdate);
        socket.off("order_updated", handleOrderUpdated);
        socket.off("order_item_cancelled", handleItemCancellation);
        socket.off("order_item_returned", handleItemReturn);
      };
    }
  }, [socket, sessionDetails, orders, updateOrders, updateSessionDetails]);

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

  // Map backend statuses to customer-friendly display statuses
  const getDisplayStatus = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "admin_approved":
        return "Accepted";
      case "in_preparation":
      case "ready_for_pickup":
        return "Preparing";
      case "served":
        return "Served";
      case "canceled":
        return "Canceled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusColor = (status) => {
    // Map both backend and customer-friendly statuses
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "accepted":
      case "admin_approved":
        return "text-blue-500";
      case "preparing":
      case "in_preparation":
      case "ready_for_pickup":
        return "text-blue-500";
      case "served":
        return "text-green-500";
      case "canceled":
        return "text-red-500";
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

  // Helper function to check for active items
  const hasActiveItems = (order) => {
    if (!order || !order.items || !Array.isArray(order.items)) {
      return false;
    }

    return order.items.some((item) => {
      const effectiveQty =
        item.quantity -
        (item.cancelledQuantity || 0) -
        (item.returnedQuantity || 0);
      return effectiveQty > 0;
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
          <div
            key={order._id}
            className={`bg-white rounded-lg shadow-md p-4 ${
              order.status === "canceled" ? "border-l-4 border-red-500" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">
                {formatTime(order.createdAt)}
              </span>
              <span className={`font-medium ${getStatusColor(order.status)}`}>
                {getDisplayStatus(order.status)}
              </span>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items.map((item, index) => {
                // Calculate effective quantity after cancellations and returns
                const effectiveQty =
                  item.quantity -
                  (item.cancelledQuantity || 0) -
                  (item.returnedQuantity || 0);
                const totalItemPrice = effectiveQty * item.price;

                return (
                  <div
                    key={`${order._id}-${index}`}
                    className={`flex items-center justify-between py-2 border-b last:border-0 ${
                      effectiveQty <= 0 ? "text-gray-400" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {effectiveQty} × {item.price} SAR
                      </p>
                      {(item.cancelledQuantity || 0) > 0 && (
                        <p className="text-xs text-red-500">
                          ({item.cancelledQuantity} cancelled)
                        </p>
                      )}
                      {(item.returnedQuantity || 0) > 0 && (
                        <p className="text-xs text-red-500">
                          ({item.returnedQuantity} returned)
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      {totalItemPrice.toFixed(2)} SAR
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Order status message */}
            {order.status === "canceled" && (
              <div className="py-2 text-center text-red-500 font-medium border-t mt-2">
                This order has been canceled.
              </div>
            )}

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
