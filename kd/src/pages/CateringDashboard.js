import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { TextField, Button, CircularProgress, Alert } from "@mui/material";
import dayjs from "dayjs";
import {
  getPendingCateringOrders,
  getUpcomingCateringOrders,
  getCateringOrdersByDate,
  updateCateringOrderStatus,
} from "../utils/api.js";
import CateringOrderCard from "../components/CateringOrderCard";
import "../styles/CateringDashboard.css";

const CateringDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [dateOrders, setDateOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState({
    pending: true,
    upcoming: true,
    date: true,
  });
  const [error, setError] = useState({
    pending: null,
    upcoming: null,
    date: null,
  });
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    setLoading((prev) => ({ ...prev, pending: true }));
    setError((prev) => ({ ...prev, pending: null }));

    try {
      const result = await getPendingCateringOrders();
      if (result.success) {
        setPendingOrders(result.data.data);
      } else {
        setError((prev) => ({ ...prev, pending: result.error }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        pending: "Failed to fetch pending orders",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, pending: false }));
    }
  };

  // Fetch upcoming orders
  const fetchUpcomingOrders = async () => {
    setLoading((prev) => ({ ...prev, upcoming: true }));
    setError((prev) => ({ ...prev, upcoming: null }));

    try {
      const result = await getUpcomingCateringOrders();
      if (result.success) {
        setUpcomingOrders(result.data.data);
      } else {
        setError((prev) => ({ ...prev, upcoming: result.error }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        upcoming: "Failed to fetch upcoming orders",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, upcoming: false }));
    }
  };

  // Fetch orders by date
  const fetchOrdersByDate = async (date) => {
    setLoading((prev) => ({ ...prev, date: true }));
    setError((prev) => ({ ...prev, date: null }));

    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const result = await getCateringOrdersByDate(formattedDate);

      if (result.success) {
        setDateOrders(result.data.data);
      } else {
        setError((prev) => ({ ...prev, date: result.error }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        date: "Failed to fetch orders for selected date",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, date: false }));
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId, status) => {
    setStatusUpdateLoading(true);
    setStatusUpdateMessage(null);

    try {
      const result = await updateCateringOrderStatus(orderId, status);

      if (result.success) {
        setStatusUpdateMessage({
          type: "success",
          text: `Order status updated to ${status}`,
        });

        // Refresh all order lists
        fetchPendingOrders();
        fetchUpcomingOrders();
        fetchOrdersByDate(selectedDate);
      } else {
        setStatusUpdateMessage({
          type: "error",
          text: result.error,
        });
      }
    } catch (err) {
      setStatusUpdateMessage({
        type: "error",
        text: "Failed to update order status",
      });
    } finally {
      setStatusUpdateLoading(false);

      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusUpdateMessage(null);
      }, 3000);
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchOrdersByDate(newDate);
  };

  // Initial data fetch
  useEffect(() => {
    fetchPendingOrders();
    fetchUpcomingOrders();
    fetchOrdersByDate(selectedDate);
  }, []);

  return (
    <div className="catering-dashboard">
      <h1>Catering Dashboard</h1>

      {/* Status update notification */}
      {statusUpdateMessage && (
        <Alert severity={statusUpdateMessage.type} className="status-alert">
          {statusUpdateMessage.text}
        </Alert>
      )}

      <div className="dashboard-container">
        {/* Pending orders section */}
        <div className="dashboard-section">
          <h2>Orders Awaiting Acceptance</h2>

          {loading.pending ? (
            <div className="loading-container">
              <CircularProgress size={40} />
            </div>
          ) : error.pending ? (
            <Alert severity="error">{error.pending}</Alert>
          ) : pendingOrders.length === 0 ? (
            <p className="no-orders">No pending orders</p>
          ) : (
            <div className="order-cards-container">
              {pendingOrders.map((order) => (
                <CateringOrderCard
                  key={order._id}
                  order={order}
                  showActions={true}
                  onStatusUpdate={handleStatusUpdate}
                  statusUpdateLoading={statusUpdateLoading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Date selection section */}
        <div className="dashboard-section">
          <h2>Orders by Date</h2>

          <div className="date-picker-container">
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>

          {loading.date ? (
            <div className="loading-container">
              <CircularProgress size={40} />
            </div>
          ) : error.date ? (
            <Alert severity="error">{error.date}</Alert>
          ) : dateOrders.length === 0 ? (
            <p className="no-orders">No orders for selected date</p>
          ) : (
            <div className="order-cards-container">
              {dateOrders.map((order) => (
                <CateringOrderCard
                  key={order._id}
                  order={order}
                  showActions={
                    order.status !== "completed" && order.status !== "cancelled"
                  }
                  onStatusUpdate={handleStatusUpdate}
                  statusUpdateLoading={statusUpdateLoading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming orders section */}
        <div className="dashboard-section">
          <h2>Upcoming Orders</h2>

          <div className="section-header">
            <Button
              variant="outlined"
              size="small"
              onClick={fetchUpcomingOrders}
            >
              Refresh
            </Button>
          </div>

          {loading.upcoming ? (
            <div className="loading-container">
              <CircularProgress size={40} />
            </div>
          ) : error.upcoming ? (
            <Alert severity="error">{error.upcoming}</Alert>
          ) : upcomingOrders.length === 0 ? (
            <p className="no-orders">No upcoming orders</p>
          ) : (
            <div className="order-cards-container">
              {upcomingOrders.map((order) => (
                <CateringOrderCard
                  key={order._id}
                  order={order}
                  showActions={true}
                  onStatusUpdate={handleStatusUpdate}
                  statusUpdateLoading={statusUpdateLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CateringDashboard;
