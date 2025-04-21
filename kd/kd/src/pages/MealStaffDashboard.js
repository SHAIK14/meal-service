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
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { getAcceptedMealOrders, getStaffMealOrdersByDate } from "../utils/api";
import "../styles/MealStaffDashboard.css";

const MealStaffDashboard = () => {
  // State management
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [dateOrders, setDateOrders] = useState([]);
  const [loading, setLoading] = useState({
    current: true,
    date: false,
  });
  const [error, setError] = useState({
    current: null,
    date: null,
  });
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch accepted orders (current)
  const fetchAcceptedOrders = async () => {
    setLoading((prev) => ({ ...prev, current: true }));
    setError((prev) => ({ ...prev, current: null }));

    try {
      const result = await getAcceptedMealOrders();
      if (result.success) {
        setAcceptedOrders(result.data.data);
      } else {
        setError((prev) => ({ ...prev, current: result.error }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        current: "Failed to fetch orders",
      }));
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, current: false }));
    }
  };

  // Fetch orders by date
  const fetchOrdersByDate = async () => {
    setLoading((prev) => ({ ...prev, date: true }));
    setError((prev) => ({ ...prev, date: null }));

    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const result = await getStaffMealOrdersByDate(formattedDate);

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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && dateOrders.length === 0) {
      fetchOrdersByDate();
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Handle search
  const handleSearch = () => {
    fetchOrdersByDate();
  };

  // Filter orders based on search query
  const filteredCurrentOrders = acceptedOrders.filter(
    (order) =>
      !searchQuery ||
      (order.userDetails?.name &&
        order.userDetails.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.userDetails?.phoneNumber &&
        order.userDetails.phoneNumber.includes(searchQuery)) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDateOrders = dateOrders.filter(
    (order) =>
      !searchQuery ||
      (order.userDetails?.name &&
        order.userDetails.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.userDetails?.phoneNumber &&
        order.userDetails.phoneNumber.includes(searchQuery)) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time elapsed
  const formatTimeElapsed = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAcceptedOrders();

    // Poll for new orders every 30 seconds
    const intervalId = setInterval(() => {
      if (tabValue === 0) {
        fetchAcceptedOrders();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [tabValue]);

  return (
    <div className="page-container">
      <Container className="staff-dashboard-container">
        <Box className="dashboard-header">
          <Typography variant="h4" component="h1">
            Meal Kitchen Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={tabValue === 0 ? fetchAcceptedOrders : fetchOrdersByDate}
            disabled={loading.current || loading.date}
          >
            Refresh
          </Button>
        </Box>

        {/* Search bar */}
        <Box className="search-container">
          <TextField
            label="Search by name or phone"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        {/* Tabs for current and past */}
        <Box className="tabs-container">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Current Orders" />
            <Tab label="Past Orders" />
          </Tabs>
        </Box>

        {/* Current Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box className="section-header">
            <Typography variant="h5">Orders To Prepare</Typography>
            <Typography variant="subtitle1">
              These orders have been accepted and are waiting to be prepared
            </Typography>
          </Box>

          {loading.current ? (
            <Box className="loading-container">
              <CircularProgress />
              <Typography>Loading orders...</Typography>
            </Box>
          ) : error.current ? (
            <Alert severity="error">{error.current}</Alert>
          ) : filteredCurrentOrders.length === 0 ? (
            <Alert severity="info">
              {searchQuery
                ? "No orders match your search"
                : "No orders to prepare right now"}
            </Alert>
          ) : (
            <Grid container spacing={3} className="kitchen-orders-grid">
              {filteredCurrentOrders.map((order) => (
                <Grid item xs={12} md={6} lg={4} key={order._id}>
                  <Paper elevation={3} className="kitchen-order-paper">
                    <Box className="order-header">
                      <Box>
                        <Typography variant="h6" className="order-id">
                          Order #{order._id.substr(-6)}
                        </Typography>
                        <Chip
                          label={order.status.toUpperCase()}
                          color={
                            order.status === "accepted" ? "success" : "warning"
                          }
                          size="small"
                          className="status-chip"
                        />
                        <Chip
                          label={order.deliveryType.toUpperCase()}
                          color="primary"
                          size="small"
                          className="type-chip"
                        />
                      </Box>
                      <Typography className="time-elapsed">
                        {order.elapsedTime &&
                          formatTimeElapsed(order.elapsedTime)}
                      </Typography>
                    </Box>

                    <Divider className="order-divider" />

                    <Box className="customer-info">
                      <Typography>
                        <strong>Customer:</strong>{" "}
                        {order.userDetails?.name || "N/A"}
                      </Typography>
                      <Typography>
                        <strong>Phone:</strong>{" "}
                        {order.userDetails?.phoneNumber || "N/A"}
                      </Typography>
                    </Box>

                    <Box className="kitchen-items-list">
                      <Typography variant="subtitle2" className="items-header">
                        Items:
                      </Typography>
                      {order.items.map((item, index) => (
                        <Box key={index} className="kitchen-item">
                          <Typography
                            variant="body1"
                            className="kitchen-item-name"
                          >
                            {index + 1}. {item.nameEnglish || "Item"}
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

                    {order.deliveryType === "delivery" &&
                      order.deliveryAddress && (
                        <Box className="delivery-address">
                          <Typography variant="body2">
                            <strong>Delivery Address:</strong>{" "}
                            {order.formattedAddress || "Address not available"}
                          </Typography>
                        </Box>
                      )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Past Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box className="past-orders-container">
            <Box className="date-search-box">
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
                maxDate={dayjs()} // Prevents selecting future dates
              />
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

            <Box className="section-header">
              <Typography variant="h5">
                Orders for {selectedDate.format("MMMM D, YYYY")}
              </Typography>
            </Box>

            {loading.date ? (
              <Box className="loading-container">
                <CircularProgress />
                <Typography>Loading orders...</Typography>
              </Box>
            ) : error.date ? (
              <Alert severity="error">{error.date}</Alert>
            ) : filteredDateOrders.length === 0 ? (
              <Alert severity="info">
                {searchQuery
                  ? "No orders match your search for this date"
                  : "No orders found for selected date"}
              </Alert>
            ) : (
              <Grid container spacing={3} className="kitchen-orders-grid">
                {filteredDateOrders.map((order) => (
                  <Grid item xs={12} md={6} lg={4} key={order._id}>
                    <Paper elevation={3} className="kitchen-order-paper">
                      <Box className="order-header">
                        <Box>
                          <Typography variant="h6" className="order-id">
                            Order #{order._id.substr(-6)}
                          </Typography>
                          <Chip
                            label={order.status.toUpperCase()}
                            color={
                              order.status === "accepted"
                                ? "success"
                                : "warning"
                            }
                            size="small"
                            className="status-chip"
                          />
                          <Chip
                            label={order.deliveryType.toUpperCase()}
                            color="primary"
                            size="small"
                            className="type-chip"
                          />
                        </Box>
                        <Typography className="order-time">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>

                      <Divider className="order-divider" />

                      <Box className="customer-info">
                        <Typography>
                          <strong>Customer:</strong>{" "}
                          {order.userDetails?.name || "N/A"}
                        </Typography>
                        <Typography>
                          <strong>Phone:</strong>{" "}
                          {order.userDetails?.phoneNumber || "N/A"}
                        </Typography>
                      </Box>

                      <Box className="kitchen-items-list">
                        <Typography
                          variant="subtitle2"
                          className="items-header"
                        >
                          Items:
                        </Typography>
                        {order.items.map((item, index) => (
                          <Box key={index} className="kitchen-item">
                            <Typography
                              variant="body1"
                              className="kitchen-item-name"
                            >
                              {index + 1}. {item.nameEnglish || "Item"}
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
                    </Paper>
                  </Grid>
                ))}
              </Grid>
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

export default MealStaffDashboard;
