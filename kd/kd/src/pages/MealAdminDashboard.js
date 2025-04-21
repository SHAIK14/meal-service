import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Tabs,
  Tab,
  Paper,
  Divider,
  Grid,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import {
  getPendingMealOrders,
  getAcceptedMealOrders,
  getReadyMealOrders,
  getMealOrdersByDate,
  updateMealOrderStatus,
  getMealOrderStats,
} from "../utils/api";
import MealOrderCard from "../components/MealOrderCard";
import "../styles/MealAdminDashboard.css";

const MealAdminDashboard = () => {
  // State management
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [dateOrders, setDateOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    statusCounts: {
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    },
    todayCount: 0,
    deliveryTypeCounts: {
      pickup: 0,
      delivery: 0,
    },
  });
  const [loading, setLoading] = useState({
    pending: true,
    accepted: true,
    ready: true,
    date: false,
    stats: true,
  });
  const [error, setError] = useState({
    pending: null,
    accepted: null,
    ready: null,
    date: null,
    stats: null,
  });
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Status update loading is now handled per-card
  const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    setLoading((prev) => ({ ...prev, pending: true }));
    setError((prev) => ({ ...prev, pending: null }));

    try {
      const result = await getPendingMealOrders();
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
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, pending: false }));
    }
  };

  // Fetch accepted orders
  const fetchAcceptedOrders = async () => {
    setLoading((prev) => ({ ...prev, accepted: true }));
    setError((prev) => ({ ...prev, accepted: null }));

    try {
      const result = await getAcceptedMealOrders();
      if (result.success) {
        setAcceptedOrders(result.data.data);
      } else {
        setError((prev) => ({ ...prev, accepted: result.error }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        accepted: "Failed to fetch accepted orders",
      }));
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, accepted: false }));
    }
  };

  // Fetch ready orders
  const fetchReadyOrders = async () => {
    setLoading((prev) => ({ ...prev, ready: true }));
    setError((prev) => ({ ...prev, ready: null }));

    try {
      const result = await getReadyMealOrders();
      if (result.success) {
        setReadyOrders(result.data.data);
      } else {
        setError((prev) => ({ ...prev, ready: result.error }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        ready: "Failed to fetch ready orders",
      }));
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, ready: false }));
    }
  };

  // Fetch orders by date
  const fetchOrdersByDate = async () => {
    setLoading((prev) => ({ ...prev, date: true }));
    setError((prev) => ({ ...prev, date: null }));

    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const result = await getMealOrdersByDate(formattedDate);

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
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, date: false }));
    }
  };

  // Fetch dashboard stats
  const fetchOrderStats = async () => {
    setLoading((prev) => ({ ...prev, stats: true }));
    setError((prev) => ({ ...prev, stats: null }));

    try {
      const result = await getMealOrderStats();
      if (result.success) {
        setOrderStats(result.data.data);
      } else {
        setError((prev) => ({ ...prev, stats: result.error }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        stats: "Failed to fetch order statistics",
      }));
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 3 && dateOrders.length === 0) {
      fetchOrdersByDate();
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Handle search button click
  const handleSearch = () => {
    fetchOrdersByDate();
  };

  // Update order status
  const handleStatusUpdate = async (orderId, status) => {
    // Note: We don't set global loading state here anymore
    // Each card handles its own loading state
    setStatusUpdateMessage(null);

    try {
      const result = await updateMealOrderStatus(orderId, status);

      if (result.success) {
        setStatusUpdateMessage({
          type: "success",
          text: `Order status updated to ${status}`,
        });

        // Refresh all order lists
        fetchPendingOrders();
        fetchAcceptedOrders();
        fetchReadyOrders();
        fetchOrderStats();
        if (tabValue === 3) {
          fetchOrdersByDate();
        }
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
    }

    // Clear status message after 3 seconds
    setTimeout(() => {
      setStatusUpdateMessage(null);
    }, 3000);
  };

  // Filter orders for date tab based on search query and status filter
  const filteredDateOrders = dateOrders.filter((order) => {
    // Search query filter
    const matchesSearch =
      !searchQuery ||
      (order.userDetails?.name &&
        order.userDetails.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.userDetails?.phoneNumber &&
        order.userDetails.phoneNumber.includes(searchQuery)) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Initial data fetch
  useEffect(() => {
    fetchPendingOrders();
    fetchAcceptedOrders();
    fetchReadyOrders();
    fetchOrderStats();

    // Poll for new orders every 60 seconds
    const intervalId = setInterval(() => {
      if (tabValue === 0) {
        fetchPendingOrders();
      } else if (tabValue === 1) {
        fetchAcceptedOrders();
      } else if (tabValue === 2) {
        fetchReadyOrders();
      }
      fetchOrderStats();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [tabValue]);

  return (
    <div className="page-container">
      <Container className="admin-dashboard-container">
        <Box className="dashboard-header">
          <Typography variant="h4" component="h1">
            Meal Admin Dashboard
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Box className="stats-container">
          <Paper className="stats-paper">
            <Typography variant="h6" className="stats-title">
              Orders Overview
            </Typography>
            {loading.stats ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 2 }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : error.stats ? (
              <Typography color="error">Failed to load stats</Typography>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box className="stat-box">
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      Today's Orders
                    </Typography>
                    <Typography variant="h5">
                      {orderStats.todayCount}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box className="stat-box">
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      Pending
                    </Typography>
                    <Typography variant="h5">
                      {orderStats.statusCounts.pending}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box className="stat-box">
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      In Progress
                    </Typography>
                    <Typography variant="h5">
                      {orderStats.statusCounts.accepted +
                        orderStats.statusCounts.preparing}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box className="stat-box">
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      Ready/Delivery
                    </Typography>
                    <Typography variant="h5">
                      {orderStats.statusCounts.ready +
                        orderStats.statusCounts.out_for_delivery}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Box>

        {/* Status update notification */}
        {statusUpdateMessage && (
          <Alert severity={statusUpdateMessage.type} className="status-alert">
            {statusUpdateMessage.text}
          </Alert>
        )}

        {/* Tabs for different sections */}
        <Box className="tabs-container">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={`Pending (${orderStats.statusCounts.pending})`} />
            <Tab
              label={`In Progress (${
                orderStats.statusCounts.accepted +
                orderStats.statusCounts.preparing
              })`}
            />
            <Tab
              label={`Ready (${
                orderStats.statusCounts.ready +
                orderStats.statusCounts.out_for_delivery
              })`}
            />
            <Tab label="Search by Date" />
          </Tabs>
        </Box>

        {/* Pending Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box className="tab-header">
            <Typography variant="h6">Orders Awaiting Acceptance</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchPendingOrders}
              disabled={loading.pending}
            >
              Refresh
            </Button>
          </Box>

          {loading.pending ? (
            <Box className="loading-container">
              <CircularProgress />
              <Typography>Loading pending orders...</Typography>
            </Box>
          ) : error.pending ? (
            <Alert severity="error">{error.pending}</Alert>
          ) : pendingOrders.length === 0 ? (
            <Alert severity="info">No pending orders available</Alert>
          ) : (
            <Box className="orders-grid">
              {pendingOrders.map((order) => (
                <MealOrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  allowAcceptReject={true}
                />
              ))}
            </Box>
          )}
        </TabPanel>

        {/* In Progress Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box className="tab-header">
            <Typography variant="h6">Orders In Progress</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAcceptedOrders}
              disabled={loading.accepted}
            >
              Refresh
            </Button>
          </Box>

          {loading.accepted ? (
            <Box className="loading-container">
              <CircularProgress />
              <Typography>Loading in-progress orders...</Typography>
            </Box>
          ) : error.accepted ? (
            <Alert severity="error">{error.accepted}</Alert>
          ) : acceptedOrders.length === 0 ? (
            <Alert severity="info">No in-progress orders available</Alert>
          ) : (
            <Box className="orders-grid">
              {acceptedOrders.map((order) => (
                <MealOrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  allowAcceptReject={false}
                  allowReadyForPickup={order.status === "preparing"}
                />
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Ready Orders Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box className="tab-header">
            <Typography variant="h6">Ready for Pickup/Delivery</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchReadyOrders}
              disabled={loading.ready}
            >
              Refresh
            </Button>
          </Box>

          {loading.ready ? (
            <Box className="loading-container">
              <CircularProgress />
              <Typography>Loading ready orders...</Typography>
            </Box>
          ) : error.ready ? (
            <Alert severity="error">{error.ready}</Alert>
          ) : readyOrders.length === 0 ? (
            <Alert severity="info">No ready orders available</Alert>
          ) : (
            <Box className="orders-grid">
              {readyOrders.map((order) => (
                <MealOrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  allowAcceptReject={false}
                  allowOutForDelivery={
                    order.status === "ready" &&
                    order.deliveryType === "delivery"
                  }
                  allowComplete={
                    order.status === "ready" || order.status === "delivered"
                  }
                />
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Date Search Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box className="date-search-container">
            <Box className="search-controls">
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <TextField
                label="Search by name or phone"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <FormControl className="status-filter">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading.date}
              >
                Search
              </Button>
            </Box>

            {loading.date ? (
              <Box className="loading-container">
                <CircularProgress />
                <Typography>Loading orders...</Typography>
              </Box>
            ) : error.date ? (
              <Alert severity="error">{error.date}</Alert>
            ) : dateOrders.length === 0 ? (
              <Alert severity="info">
                No orders found for the selected date
              </Alert>
            ) : filteredDateOrders.length === 0 ? (
              <Alert severity="info">
                No orders match your search criteria
              </Alert>
            ) : (
              <Box className="orders-grid">
                {filteredDateOrders.map((order) => (
                  <MealOrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    allowAcceptReject={order.status === "pending"}
                    allowReadyForPickup={order.status === "preparing"}
                    allowOutForDelivery={
                      order.status === "ready" &&
                      order.deliveryType === "delivery"
                    }
                    allowComplete={
                      order.status === "ready" || order.status === "delivered"
                    }
                  />
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>
      </Container>
    </div>
  );
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meal-tabpanel-${index}`}
      aria-labelledby={`meal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default MealAdminDashboard;
