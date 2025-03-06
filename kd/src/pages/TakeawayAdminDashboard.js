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
  Modal,
  Divider,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import {
  getPendingTakeawayOrders,
  getAcceptedTakeawayOrders,
  getTakeawayOrdersByDate,
  updateTakeawayOrderStatus,
  generateTakeawayKOT,
} from "../utils/api";
import TakeawayOrderCard from "../components/TakeawayOrderCard";
import "../styles/TakeawayAdminDashboard.css";

const TakeawayAdminDashboard = () => {
  // State management
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [dateOrders, setDateOrders] = useState([]);
  const [loading, setLoading] = useState({
    pending: true,
    accepted: true,
    date: false,
  });
  const [error, setError] = useState({
    pending: null,
    accepted: null,
    date: null,
  });
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [kotGenerationLoading, setKotGenerationLoading] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);
  const [kotData, setKotData] = useState(null);
  const [isKotModalOpen, setIsKotModalOpen] = useState(false);

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    setLoading((prev) => ({ ...prev, pending: true }));
    setError((prev) => ({ ...prev, pending: null }));

    try {
      const result = await getPendingTakeawayOrders();
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
      const result = await getAcceptedTakeawayOrders();
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

  // Fetch orders by date
  const fetchOrdersByDate = async () => {
    setLoading((prev) => ({ ...prev, date: true }));
    setError((prev) => ({ ...prev, date: null }));

    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const result = await getTakeawayOrdersByDate(formattedDate);

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
    if (newValue === 2 && dateOrders.length === 0) {
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
    setStatusUpdateLoading(true);
    setStatusUpdateMessage(null);

    try {
      const result = await updateTakeawayOrderStatus(orderId, status);

      if (result.success) {
        setStatusUpdateMessage({
          type: "success",
          text: `Order status updated to ${status}`,
        });

        // Refresh all order lists
        fetchPendingOrders();
        fetchAcceptedOrders();
        if (tabValue === 2) {
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
    } finally {
      setStatusUpdateLoading(false);

      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusUpdateMessage(null);
      }, 3000);
    }
  };

  // Generate KOT
  const handleGenerateKOT = async (orderId) => {
    setKotGenerationLoading(true);
    setStatusUpdateMessage(null);

    try {
      const result = await generateTakeawayKOT(orderId);

      if (result.success) {
        setKotData(result.data.data);
        setIsKotModalOpen(true);

        // Refresh order lists
        fetchAcceptedOrders();
        fetchPendingOrders();
        if (tabValue === 2) {
          fetchOrdersByDate();
        }
      } else {
        setStatusUpdateMessage({
          type: "error",
          text: result.error || "Failed to generate KOT",
        });
      }
    } catch (err) {
      setStatusUpdateMessage({
        type: "error",
        text: "Failed to generate KOT",
      });
      console.error(err);
    } finally {
      setKotGenerationLoading(false);
    }
  };

  // Handle printing KOT
  const handlePrintKOT = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Kitchen Order Ticket - Token ${
            kotData.orderDetails.tokenNumber
          }</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .token {
              font-size: 24px;
              font-weight: bold;
              border: 2px solid #000;
              padding: 8px;
              text-align: center;
              margin-bottom: 15px;
            }
            .section {
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Kitchen Order Ticket</h2>
            <p>${kotData.orderDetails.branchName}</p>
            <p>${new Date(kotData.orderDetails.orderDate).toLocaleString()}</p>
          </div>
          
          <div class="token">
            Token: ${kotData.orderDetails.tokenNumber}
          </div>
          
          <div class="section">
            <p><strong>Customer:</strong> ${
              kotData.orderDetails.customerName
            }</p>
            <p><strong>Phone:</strong> ${kotData.orderDetails.customerPhone}</p>
          </div>
          
          <div class="section">
            <h3>Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${kotData.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <p><strong>Total Amount:</strong> ${kotData.totalAmount}</p>
            ${
              kotData.notes
                ? `<p><strong>Notes:</strong> ${kotData.notes}</p>`
                : ""
            }
          </div>
          
          <div class="footer">
            <p>Thank you for your order!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Close KOT modal
  const handleCloseKotModal = () => {
    setIsKotModalOpen(false);
    setKotData(null);
  };

  // Filter orders for date tab based on search query
  const filteredDateOrders = dateOrders.filter(
    (order) =>
      order.tokenNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery)
  );

  // Initial data fetch
  useEffect(() => {
    fetchPendingOrders();
    fetchAcceptedOrders();

    // Poll for new orders every 60 seconds
    const intervalId = setInterval(() => {
      if (tabValue === 0) {
        fetchPendingOrders();
      } else if (tabValue === 1) {
        fetchAcceptedOrders();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [tabValue]);

  return (
    <div className="page-container">
      <Container className="admin-dashboard-container">
        <Box className="dashboard-header">
          <Typography variant="h4" component="h1">
            Takeaway Admin Dashboard
          </Typography>
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
            <Tab label="Pending Orders" />
            <Tab label="Orders" />
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
                <TakeawayOrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onGenerateKOT={handleGenerateKOT}
                  allowAcceptReject={true}
                  allowKOT={false}
                  statusUpdateLoading={statusUpdateLoading}
                  kotGenerationLoading={kotGenerationLoading}
                />
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Accepted Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box className="tab-header">
            <Typography variant="h6">Orders Ready for KOT</Typography>
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
              <Typography>Loading accepted orders...</Typography>
            </Box>
          ) : error.accepted ? (
            <Alert severity="error">{error.accepted}</Alert>
          ) : acceptedOrders.length === 0 ? (
            <Alert severity="info">No accepted orders available</Alert>
          ) : (
            <Box className="orders-grid">
              {acceptedOrders
                .filter(
                  (order) =>
                    (order.status === "accepted" ||
                      order.status === "kot-generated") &&
                    order.status !== "completed"
                )
                .map((order) => (
                  <TakeawayOrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onGenerateKOT={handleGenerateKOT}
                    allowAcceptReject={false}
                    allowKOT={true}
                    allowComplete={true}
                    statusUpdateLoading={statusUpdateLoading}
                    kotGenerationLoading={kotGenerationLoading}
                  />
                ))}
            </Box>
          )}
        </TabPanel>

        {/* Date Search Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box className="date-search-container">
            <Box className="search-controls">
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <TextField
                label="Search by token, name or phone"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
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
                  <TakeawayOrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onGenerateKOT={handleGenerateKOT}
                    allowAcceptReject={order.status === "pending"}
                    allowKOT={
                      order.status === "accepted" ||
                      order.status === "kot-generated"
                    }
                    allowComplete={
                      order.status === "accepted" ||
                      order.status === "kot-generated"
                    }
                    statusUpdateLoading={statusUpdateLoading}
                    kotGenerationLoading={kotGenerationLoading}
                  />
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* KOT Modal */}
        <Modal
          open={isKotModalOpen}
          onClose={handleCloseKotModal}
          aria-labelledby="kot-modal-title"
          aria-describedby="kot-modal-description"
          className="kot-modal"
        >
          <Paper className="kot-modal-content">
            {kotData && (
              <>
                <Typography variant="h5" id="kot-modal-title" gutterBottom>
                  Kitchen Order Ticket
                </Typography>

                <Box className="kot-token-box">
                  <Typography variant="h4">
                    Token: {kotData.orderDetails.tokenNumber}
                  </Typography>
                </Box>

                <Grid container spacing={2} className="kot-details">
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Branch:</strong> {kotData.orderDetails.branchName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Date:</strong>{" "}
                      {new Date(
                        kotData.orderDetails.orderDate
                      ).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Customer:</strong>{" "}
                      {kotData.orderDetails.customerName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong>{" "}
                      {kotData.orderDetails.customerPhone}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider className="kot-divider" />

                <Typography variant="h6">Order Items</Typography>
                <Box className="kot-items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kotData.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>

                <Box className="kot-total">
                  <Typography variant="h6">
                    Total: {kotData.totalAmount}
                  </Typography>
                </Box>

                {kotData.notes && (
                  <Box className="kot-notes">
                    <Typography variant="body1">
                      <strong>Notes:</strong> {kotData.notes}
                    </Typography>
                  </Box>
                )}

                <Box className="kot-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePrintKOT}
                  >
                    Print KOT
                  </Button>
                  <Button variant="outlined" onClick={handleCloseKotModal}>
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Modal>
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
      id={`takeaway-tabpanel-${index}`}
      aria-labelledby={`takeaway-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default TakeawayAdminDashboard;
