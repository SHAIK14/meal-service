import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonGroup,
  Divider,
  DialogContentText,
} from "@mui/material";
import {
  AccessTime,
  Person,
  Phone,
  Event,
  Restaurant,
  LocalDining,
  WarningAmber,
  CreditCard,
  Payments,
} from "@mui/icons-material";
import "../styles/CateringOrderCard.css";

const CateringOrderCard = ({
  order,
  showActions,
  onStatusUpdate,
  statusUpdateLoading,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ff9800"; // Orange
      case "accepted":
        return "#2196f3"; // Blue
      case "preparing":
        return "#9c27b0"; // Purple
      case "ready":
        return "#4caf50"; // Green
      case "completed":
        return "#607d8b"; // Blue Grey
      case "cancelled":
        return "#f44336"; // Red
      default:
        return "#757575"; // Grey
    }
  };

  // Calculate due amount
  const getDueAmount = () => {
    const total = order.totalAmount || 0;
    const advance = order.advanceAmount || 0;
    return total - advance;
  };

  // Check if order has outstanding balance
  const hasOutstandingBalance = () => {
    return getDueAmount() > 0;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toFixed(2) + " SAR";
  };

  const handleDetailsOpen = () => {
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
  };

  const handleCancelConfirmOpen = () => {
    setCancelConfirmOpen(true);
  };

  const handleCancelConfirmClose = () => {
    setCancelConfirmOpen(false);
  };

  const handleCompleteConfirmOpen = () => {
    if (hasOutstandingBalance()) {
      setCompleteConfirmOpen(true);
    } else {
      // If no outstanding balance, complete directly
      handleCompleteOrder();
    }
  };

  const handleCompleteConfirmClose = () => {
    setCompleteConfirmOpen(false);
  };

  const handleCancelOrder = () => {
    onStatusUpdate(order._id, "cancelled");
    setCancelConfirmOpen(false);
    handleDetailsClose();
  };

  const handleCompleteOrder = () => {
    onStatusUpdate(order._id, "completed");
    setCompleteConfirmOpen(false);
    handleDetailsClose();
  };

  // Payment status label
  const getPaymentStatusLabel = () => {
    const total = order.totalAmount || 0;
    const advance = order.advanceAmount || 0;

    if (advance >= total) {
      return "Fully Paid";
    } else if (advance > 0) {
      return "Partially Paid";
    } else {
      return "Not Paid";
    }
  };

  // Payment status color
  const getPaymentStatusColor = () => {
    const total = order.totalAmount || 0;
    const advance = order.advanceAmount || 0;

    if (advance >= total) {
      return "#4caf50"; // Green
    } else if (advance > 0) {
      return "#ff9800"; // Orange
    } else {
      return "#757575"; // Grey
    }
  };

  return (
    <Card className="catering-order-card">
      <CardContent>
        <div className="card-header">
          <Chip
            label={order.status.toUpperCase()}
            style={{
              backgroundColor: getStatusColor(order.status),
              color: "white",
            }}
          />
          <Typography variant="body2" color="textSecondary">
            #{order._id.substring(order._id.length - 6)}
          </Typography>
        </div>

        <div className="order-info">
          <div className="info-row">
            <Event className="icon" />
            <Typography variant="body1">
              {formatDate(order.eventDate)}
            </Typography>
          </div>

          <div className="info-row">
            <AccessTime className="icon" />
            <Typography variant="body1">{order.eventTime}</Typography>
          </div>

          <div className="info-row">
            <Person className="icon" />
            <Typography variant="body1" noWrap>
              {order.customerName}
            </Typography>
          </div>

          <div className="info-row">
            <Phone className="icon" />
            <Typography variant="body1">{order.customerContact}</Typography>
          </div>

          <div className="info-row">
            <LocalDining className="icon" />
            <Typography variant="body1">
              {order.cateringType.charAt(0).toUpperCase() +
                order.cateringType.slice(1)}{" "}
              • {order.numberOfPeople} people
            </Typography>
          </div>

          {/* Payment Status Row */}
          <div className="info-row">
            <Payments className="icon" />
            <Typography variant="body1">
              {formatCurrency(order.totalAmount)}
              {" • "}
              <span style={{ color: getPaymentStatusColor() }}>
                {getPaymentStatusLabel()}
              </span>
            </Typography>
          </div>
        </div>

        <div className="order-items-summary">
          <Typography variant="body2" color="textSecondary">
            {order.items.length} items
            {order.isPremium && " • Premium Order"}
          </Typography>
        </div>

        <div className="card-actions">
          <Button variant="outlined" size="small" onClick={handleDetailsOpen}>
            View Details
          </Button>

          {showActions && order.status === "pending" && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={statusUpdateLoading}
              onClick={() => onStatusUpdate(order._id, "accepted")}
            >
              Accept
            </Button>
          )}

          {showActions && order.status === "accepted" && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disabled={statusUpdateLoading}
              onClick={() => onStatusUpdate(order._id, "preparing")}
            >
              Start Preparing
            </Button>
          )}

          {showActions && order.status === "preparing" && (
            <Button
              variant="contained"
              style={{ backgroundColor: "#4caf50", color: "white" }}
              size="small"
              disabled={statusUpdateLoading}
              onClick={() => onStatusUpdate(order._id, "ready")}
            >
              Mark Ready
            </Button>
          )}

          {showActions && order.status === "ready" && (
            <Button
              variant="contained"
              style={{ backgroundColor: "#607d8b", color: "white" }}
              size="small"
              disabled={statusUpdateLoading}
              onClick={handleCompleteConfirmOpen}
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Order Details
          <Typography variant="subtitle2" color="textSecondary">
            #{order._id.substring(order._id.length - 6)}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Customer Information
          </Typography>

          <div className="dialog-info-section">
            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Name:
              </Typography>
              <Typography variant="body1">{order.customerName}</Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Contact:
              </Typography>
              <Typography variant="body1">{order.customerContact}</Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Referral:
              </Typography>
              <Typography variant="body1">
                {order.referralSource}
                {order.referralSource === "staff" && ` (${order.staffName})`}
              </Typography>
            </div>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          <Typography variant="h6" gutterBottom>
            Event Details
          </Typography>

          <div className="dialog-info-section">
            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Date:
              </Typography>
              <Typography variant="body1">
                {formatDate(order.eventDate)}
              </Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Time:
              </Typography>
              <Typography variant="body1">{order.eventTime}</Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Type:
              </Typography>
              <Typography variant="body1">
                {order.cateringType.charAt(0).toUpperCase() +
                  order.cateringType.slice(1)}
              </Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                People:
              </Typography>
              <Typography variant="body1">{order.numberOfPeople}</Typography>
            </div>

            {order.notes && (
              <div className="dialog-info-row">
                <Typography variant="body2" color="textSecondary">
                  Notes:
                </Typography>
                <Typography variant="body1">{order.notes}</Typography>
              </div>
            )}
          </div>

          {/* Premium details section */}
          {order.isPremium && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <Typography variant="h6" gutterBottom>
                Premium Details
              </Typography>
              <div className="dialog-info-section">
                <Typography variant="body1">{order.premiumDetails}</Typography>
              </div>
            </>
          )}

          <Divider style={{ margin: "16px 0" }} />

          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>

          <div className="order-items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-item-details">
                  <Typography variant="body1">
                    {item.quantity} x {item.nameEnglish || item.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {(item.price * item.quantity).toFixed(2)} SAR
                  </Typography>
                </div>
              </div>
            ))}
          </div>

          <Divider style={{ margin: "16px 0" }} />

          {/* Payment Details Section */}
          <Typography variant="h6" gutterBottom>
            Payment Details
          </Typography>

          <div className="payment-details">
            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Total:
              </Typography>
              <Typography variant="body1">
                {formatCurrency(order.totalAmount)}
                {order.isPremium && " (Premium)"}
              </Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Advance:
              </Typography>
              <Typography variant="body1">
                {formatCurrency(order.advanceAmount || 0)}
              </Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Due:
              </Typography>
              <Typography
                variant="body1"
                style={{
                  color: getDueAmount() > 0 ? "#f44336" : "#4caf50",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(getDueAmount())}
              </Typography>
            </div>

            <div className="dialog-info-row">
              <Typography variant="body2" color="textSecondary">
                Status:
              </Typography>
              <Typography
                variant="body1"
                style={{ color: getPaymentStatusColor() }}
              >
                {getPaymentStatusLabel()}
              </Typography>
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          {showActions && (
            <div className="dialog-actions">
              {order.status === "pending" && (
                <ButtonGroup variant="contained" size="small">
                  <Button
                    color="primary"
                    disabled={statusUpdateLoading}
                    onClick={() => {
                      onStatusUpdate(order._id, "accepted");
                      handleDetailsClose();
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    color="error"
                    disabled={statusUpdateLoading}
                    onClick={handleCancelConfirmOpen}
                  >
                    Decline
                  </Button>
                </ButtonGroup>
              )}

              {order.status === "accepted" && (
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={statusUpdateLoading}
                  onClick={() => {
                    onStatusUpdate(order._id, "preparing");
                    handleDetailsClose();
                  }}
                >
                  Start Preparing
                </Button>
              )}

              {order.status === "preparing" && (
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#4caf50", color: "white" }}
                  disabled={statusUpdateLoading}
                  onClick={() => {
                    onStatusUpdate(order._id, "ready");
                    handleDetailsClose();
                  }}
                >
                  Mark Ready
                </Button>
              )}

              {order.status === "ready" && (
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#607d8b", color: "white" }}
                  disabled={statusUpdateLoading}
                  onClick={handleCompleteConfirmOpen}
                >
                  Complete
                </Button>
              )}
            </div>
          )}

          <Button onClick={handleDetailsClose} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelConfirmOpen}
        onClose={handleCancelConfirmClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <div style={{ display: "flex", alignItems: "center" }}>
            <WarningAmber color="error" style={{ marginRight: "8px" }} />
            Cancel Order
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmClose} color="inherit">
            No, Keep Order
          </Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete with Due Amount Confirmation Dialog */}
      <Dialog
        open={completeConfirmOpen}
        onClose={handleCompleteConfirmClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CreditCard color="warning" style={{ marginRight: "8px" }} />
            Outstanding Balance
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This order has an outstanding balance of{" "}
            <strong>{formatCurrency(getDueAmount())}</strong>. Do you want to
            complete it anyway?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteConfirmClose} color="inherit">
            No, Keep Pending
          </Button>
          <Button
            onClick={handleCompleteOrder}
            color="primary"
            variant="contained"
          >
            Yes, Complete Order
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CateringOrderCard;
