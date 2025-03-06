// src/components/OrderStatus.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderStatus } from "../utils/api";
import {
  FaUtensils,
  FaChevronLeft,
  FaCheckCircle,
  FaSpinner,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const OrderStatus = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setLoading(true);
        const response = await getOrderStatus(token);

        if (response.success) {
          setOrder(response.data);
        } else {
          setError(response.message || "Failed to fetch order status");
          toast.error(response.message || "Failed to fetch order status");
        }
      } catch (err) {
        console.error("Error fetching order status:", err);
        setError("Failed to fetch order status");
        toast.error("Failed to fetch order status");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();

    // Set up polling to check status every 30 seconds
    const interval = setInterval(fetchOrderStatus, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500" size={24} />;
      case "accepted":
        return <FaSpinner className="text-blue-500" size={24} />;
      case "completed":
        return <FaCheckCircle className="text-green-500" size={24} />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" size={24} />;
      default:
        return <FaClock className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Waiting for confirmation";
      case "accepted":
        return "Being prepared";
      case "completed":
        return "Ready for pickup";
      case "cancelled":
        return "Order cancelled";
      default:
        return "Unknown status";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-1"
              aria-label="Go back"
            >
              <FaChevronLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-medium text-gray-900">
                Order Status
              </h1>
              {!loading && order && (
                <p className="text-xs text-gray-500">Token: {token}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">
              Fetching order status...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg p-6 text-center">
            <div className="text-red-500 mb-2">
              <FaTimesCircle size={32} className="mx-auto" />
            </div>
            <h2 className="text-lg font-medium text-red-800 mb-2">
              Order Not Found
            </h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium"
            >
              Go to Home
            </button>
          </div>
        ) : order ? (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="mr-4">{getStatusIcon(order.status)}</div>
                <div>
                  <div className="text-sm text-gray-500">Current Status</div>
                  <div className="text-lg font-medium text-gray-900">
                    {getStatusText(order.status)}
                  </div>
                </div>
              </div>

              {order.status === "completed" && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                  Your order is ready! Please proceed to the counter with your
                  token number.
                </div>
              )}

              {order.status === "pending" && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                  Your order is waiting for confirmation. Please wait.
                </div>
              )}
            </div>

            {/* Order Details */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-medium text-gray-900 mb-3">
                  Order Details
                </h2>

                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <span className="w-5 text-center text-gray-900 font-medium">
                          {item.quantity}x
                        </span>
                        <span className="ml-2 text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {parseFloat(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 flex justify-between">
                  <span className="font-medium text-gray-900">
                    Total Amount
                  </span>
                  <span className="font-medium text-gray-900">
                    {parseFloat(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Branch & Customer Info */}
            <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
              <div className="mb-3">
                <div className="text-gray-500 font-medium">Branch</div>
                <div className="text-gray-900">
                  {order.branchName || "Not available"}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-gray-500 font-medium">Customer Name</div>
                <div className="text-gray-900">
                  {order.customerName || "Not available"}
                </div>
              </div>

              <div>
                <div className="text-gray-500 font-medium">Order Date</div>
                <div className="text-gray-900">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString()
                    : "Not available"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No order information available</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderStatus;
