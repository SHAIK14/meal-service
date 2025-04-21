import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Paper,
  Grid,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getAcceptedTakeawayOrders,
  updateTakeawayOrderStatus,
} from "../utils/api";
import TakeawayOrderCard from "../components/TakeawayOrderCard";
import "../styles/TakeawayWorkerDashboard.css";

const TakeawayWorkerDashboard = () => {
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);

  // Fetch accepted orders
  const fetchAcceptedOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAcceptedTakeawayOrders();
      if (result.success) {
        setAcceptedOrders(result.data.data);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Failed to fetch accepted orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle order status change
  const handleStatusUpdate = async (orderId, status) => {
    setStatusUpdateLoading(true);
    setStatusUpdateMessage(null);
    try {
      const result = await updateTakeawayOrderStatus(orderId, status);
      if (result.success) {
        setStatusUpdateMessage({
          type: "success",
          text: `Order status updated to ${status}`,
        });
        // Refresh orders
        fetchAcceptedOrders();
      } else {
        setStatusUpdateMessage({
          type: "error",
          text: result.error || "Failed to update status",
        });
      }
    } catch (err) {
      setStatusUpdateMessage({
        type: "error",
        text: "Failed to update order status",
      });
      console.error(err);
    } finally {
      setStatusUpdateLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setStatusUpdateMessage(null);
      }, 3000);
    }
  };

  // Filter orders - only show accepted and kot-generated, not completed
  const filteredOrders = acceptedOrders.filter(
    (order) =>
      // Only show accepted or kot-generated orders (not completed)
      (order.status === "accepted" || order.status === "kot-generated") &&
      // Apply search filter
      (order.tokenNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone?.includes(searchQuery))
  );

  // Initial data fetch
  useEffect(() => {
    fetchAcceptedOrders();

    // Poll for new orders every 30 seconds
    const intervalId = setInterval(() => {
      fetchAcceptedOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="page-container">
      <Container className="worker-dashboard-container">
        <Box className="dashboard-header">
          <Typography variant="h4" component="h1">
            Takeaway Kitchen Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAcceptedOrders}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Status update message */}
        {statusUpdateMessage && (
          <Alert severity={statusUpdateMessage.type} className="status-alert">
            {statusUpdateMessage.text}
          </Alert>
        )}

        {/* Search bar */}
        <Box className="search-container">
          <TextField
            label="Search by token"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        {/* Orders to prepare */}
        <Box className="orders-container">
          <Typography variant="h5" className="section-title">
            Orders To Prepare
          </Typography>

          {loading ? (
            <Box className="loading-container">
              <CircularProgress />
              <Typography>Loading orders...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredOrders.length === 0 ? (
            <Alert severity="info">
              {searchQuery
                ? "No orders match your search"
                : "No orders to prepare right now"}
            </Alert>
          ) : (
            <Grid container spacing={3} className="kitchen-orders-grid">
              {filteredOrders.map((order) => (
                <Grid item xs={12} md={6} lg={4} key={order._id}>
                  <Paper elevation={3} className="kitchen-order-paper">
                    <Typography variant="h6" className="kitchen-order-token">
                      Token: {order.tokenNumber}
                    </Typography>

                    <Chip
                      label={order.status.toUpperCase()}
                      color={
                        order.status === "accepted" ? "success" : "primary"
                      }
                      size="small"
                      className="kitchen-status-chip"
                    />

                    <Box className="kitchen-items-list">
                      {order.items.map((item, index) => (
                        <Box key={index} className="kitchen-item">
                          <Typography
                            variant="body1"
                            className="kitchen-item-name"
                          >
                            {index + 1}. {item.nameEnglish || item.name}
                          </Typography>
                          <Typography
                            variant="body1"
                            className="kitchen-item-quantity"
                          >
                            x{item.quantity}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {order.notes && (
                      <Box className="kitchen-notes">
                        <Typography variant="body2">
                          <strong>Notes:</strong> {order.notes}
                        </Typography>
                      </Box>
                    )}

                    <Box className="kitchen-action-button">
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={() =>
                          handleStatusUpdate(order._id, "completed")
                        }
                        disabled={statusUpdateLoading}
                      >
                        {statusUpdateLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Mark Completed"
                        )}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default TakeawayWorkerDashboard;
