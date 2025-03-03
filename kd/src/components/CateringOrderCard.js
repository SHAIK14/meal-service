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
} from "@mui/material";
import {
  AccessTime,
  Person,
  Phone,
  Event,
  Restaurant,
  LocalDining,
} from "@mui/icons-material";
import "../styles/CateringOrderCard.css";

const CateringOrderCard = ({
  order,
  showActions,
  onStatusUpdate,
  statusUpdateLoading,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const handleDetailsOpen = () => {
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
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
        </div>

        <div className="order-items-summary">
          <Typography variant="body2" color="textSecondary">
            {order.items.length} items • {order.totalAmount.toFixed(2)} SAR
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
              onClick={() => onStatusUpdate(order._id, "completed")}
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

          <div className="order-total">
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">
              {order.totalAmount.toFixed(2)} SAR
            </Typography>
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
                    onClick={() => {
                      onStatusUpdate(order._id, "cancelled");
                      handleDetailsClose();
                    }}
                  >
                    Cancel
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
                  onClick={() => {
                    onStatusUpdate(order._id, "completed");
                    handleDetailsClose();
                  }}
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
    </Card>
  );
};

export default CateringOrderCard;
