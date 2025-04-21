import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Collapse,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import "../styles/MealOrderCard.css";

const MealOrderCard = ({
  order,
  onStatusUpdate,
  allowAcceptReject = false,
  allowReadyForPickup = false,
  allowOutForDelivery = false,
  allowComplete = false,
  statusUpdateLoading = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Toggle expanded view
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Format the date and time
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

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

  // Status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "default";
      case "accepted":
        return "primary";
      case "preparing":
        return "warning";
      case "ready":
        return "success";
      case "out_for_delivery":
        return "info";
      case "delivered":
        return "success";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // Display status text for better readability
  const getStatusText = (status) => {
    switch (status) {
      case "out_for_delivery":
        return "On Delivery";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Handler functions with loading state per card
  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(order._id, newStatus);
    setIsUpdating(false);
  };

  // Summary of items for compact view
  const getItemsSummary = () => {
    if (!order.items || order.items.length === 0) return "No items";

    const itemCount = order.items.length;
    const totalQuantity = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return `${itemCount} item${
      itemCount > 1 ? "s" : ""
    } (${totalQuantity} total)`;
  };

  return (
    <Paper className="meal-order-card">
      {/* Compact View (Always Visible) */}
      <Box className="card-header">
        <Box className="order-info">
          <Typography variant="h6" className="order-id">
            Order #{order._id.substr(-6)}
          </Typography>
          <Box className="chips-container">
            <Chip
              label={getStatusText(order.status)}
              color={getStatusColor(order.status)}
              size="small"
              className="status-chip"
            />
            <Chip
              label={order.deliveryType.toUpperCase()}
              color={order.deliveryType === "delivery" ? "info" : "secondary"}
              variant="outlined"
              size="small"
              className="type-chip"
            />
          </Box>
        </Box>
        <Box className="card-header-right">
          <Typography className="order-time">
            {order.elapsedTime && (
              <span className="elapsed">
                {formatTimeElapsed(order.elapsedTime)}
              </span>
            )}
          </Typography>
          <IconButton
            size="small"
            onClick={toggleExpand}
            className="expand-button"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Compact Info */}
      <Box className="compact-info">
        <Typography className="compact-customer">
          <strong>Customer:</strong> {order.userDetails?.name || "N/A"}
        </Typography>
        <Typography className="compact-items">
          <strong>Items:</strong> {getItemsSummary()}
        </Typography>
        <Typography className="compact-amount">
          <strong>Amount:</strong> SAR {order.totalAmount.toFixed(2)}
        </Typography>
      </Box>

      {/* Action Buttons (Always Visible) */}
      <Box className="card-actions">
        {allowAcceptReject && (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={() => handleStatusUpdate("accepted")}
              disabled={isUpdating}
              className="action-button"
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={() => handleStatusUpdate("cancelled")}
              disabled={isUpdating}
              className="action-button"
            >
              Reject
            </Button>
          </>
        )}

        {order.status === "accepted" && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<RestaurantIcon />}
            onClick={() => handleStatusUpdate("preparing")}
            disabled={isUpdating}
            className="action-button"
          >
            Preparing
          </Button>
        )}

        {allowReadyForPickup && (
          <Button
            variant="contained"
            color="success"
            onClick={() => handleStatusUpdate("ready")}
            disabled={isUpdating}
            className="action-button"
          >
            Ready
          </Button>
        )}

        {allowOutForDelivery && (
          <Button
            variant="contained"
            color="info"
            startIcon={<LocalShippingIcon />}
            onClick={() => handleStatusUpdate("out_for_delivery")}
            disabled={isUpdating}
            className="action-button"
          >
            Deliver
          </Button>
        )}

        {allowComplete && (
          <Button
            variant="contained"
            color="success"
            startIcon={<DoneAllIcon />}
            onClick={() =>
              handleStatusUpdate(
                order.status === "delivered" || order.deliveryType === "pickup"
                  ? "completed"
                  : "delivered"
              )
            }
            disabled={isUpdating}
            className="action-button"
          >
            {order.status === "delivered" || order.deliveryType === "pickup"
              ? "Complete"
              : "Delivered"}
          </Button>
        )}

        {isUpdating && <CircularProgress size={24} className="card-loader" />}
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider className="card-divider" />
        <Box className="card-details">
          <Box className="detail-section">
            <Typography className="section-title">Order Details</Typography>
            <Typography>
              <strong>Order ID:</strong> {order._id}
            </Typography>
            <Typography>
              <strong>Created:</strong> {formatDate(order.createdAt)}
            </Typography>
            <Typography>
              <strong>Status:</strong> {getStatusText(order.status)}
            </Typography>
          </Box>

          <Box className="detail-section">
            <Typography className="section-title">Customer Details</Typography>
            <Typography>
              <strong>Name:</strong> {order.userDetails?.name || "N/A"}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {order.userDetails?.phoneNumber || "N/A"}
            </Typography>

            {order.deliveryType === "delivery" && order.deliveryAddress && (
              <>
                <Typography className="section-title mt-2">
                  Delivery Address
                </Typography>
                <Typography className="address-text">
                  {order.formattedAddress || "Address not available"}
                </Typography>
              </>
            )}
          </Box>

          <Box className="detail-section">
            <Typography className="section-title">Items</Typography>
            <Box className="items-list">
              {order.items.map((item, index) => (
                <Box key={index} className="item-row">
                  <Typography className="item-name">
                    {index + 1}. {item.nameEnglish || "Item"}
                  </Typography>
                  <Typography className="item-quantity">
                    x{item.quantity}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {order.notes && (
            <Box className="detail-section">
              <Typography className="section-title">Notes</Typography>
              <Typography className="notes-text">{order.notes}</Typography>
            </Box>
          )}

          <Box className="detail-section">
            <Typography className="section-title">Payment</Typography>
            <Typography>
              <strong>Amount:</strong> SAR {order.totalAmount.toFixed(2)}
            </Typography>
            <Typography>
              <strong>Method:</strong> {order.paymentMethod || "Cash"}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MealOrderCard;
