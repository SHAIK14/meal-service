import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import "../styles/TakeawayOrderCard.css";

const TakeawayOrderCard = ({
  order,
  onStatusUpdate,
  onGenerateKOT,
  allowAcceptReject = true,
  allowKOT = false,
  allowComplete = false,
  isKitchenView = false,
  statusUpdateLoading,
  kotGenerationLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ff9800"; // Orange
      case "accepted":
        return "#4caf50"; // Green
      case "declined":
        return "#f44336"; // Red
      case "kot-generated":
        return "#2196f3"; // Blue
      case "completed":
        return "#673ab7"; // Purple
      default:
        return "#757575"; // Grey
    }
  };

  // Handle accept order
  const handleAccept = async () => {
    setIsLoading(true);
    await onStatusUpdate(order._id, "accepted");
    setIsLoading(false);
  };

  // Handle decline order
  const handleDecline = async () => {
    setIsLoading(true);
    await onStatusUpdate(order._id, "declined");
    setIsLoading(false);
  };

  // Handle generate KOT
  const handleGenerateKOT = async () => {
    setIsLoading(true);
    await onGenerateKOT(order._id);
    setIsLoading(false);
  };

  // Handle mark as completed
  const handleMarkCompleted = async () => {
    setIsLoading(true);
    await onStatusUpdate(order._id, "completed");
    setIsLoading(false);
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      className={`takeaway-order-card ${isKitchenView ? "kitchen-view" : ""}`}
    >
      <CardContent>
        {/* Header with token and status */}
        <Box className="order-header">
          <Box className="order-token-container">
            <Typography variant="h6" className="token-number">
              Token: {order.tokenNumber}
            </Typography>
            <Chip
              label={order.status.toUpperCase()}
              style={{
                backgroundColor: getStatusColor(order.status),
                color: "white",
              }}
              className="status-chip"
            />
          </Box>
          <Typography variant="body2" className="order-time">
            <AccessTimeIcon fontSize="small" className="icon" />
            {formatDate(order.orderDate)}
          </Typography>
        </Box>

        {/* Kitchen view shows minimal customer info */}
        {!isKitchenView && (
          <Box className="customer-info">
            <Typography variant="body1">
              <PersonIcon fontSize="small" className="icon" />
              {order.customerName}
            </Typography>
            <Typography variant="body1">
              <PhoneIcon fontSize="small" className="icon" />
              {order.customerPhone}
            </Typography>
          </Box>
        )}

        {/* Order items summary */}
        <Box className="order-summary">
          <Typography variant="body1">
            <ReceiptIcon fontSize="small" className="icon" />
            {order.items.length} items | Total: {order.totalAmount}
          </Typography>
          <IconButton
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Expanded order details */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider className="divider" />
          <List className="item-list">
            {order.items.map((item, index) => (
              <ListItem key={index} className="item-list-item">
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {item.nameEnglish || item.name} x {item.quantity}
                    </Typography>
                  }
                  secondary={
                    !isKitchenView && (
                      <Typography variant="body2" color="textSecondary">
                        Price: {item.price}
                      </Typography>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
          {order.notes && (
            <Box className="notes-section">
              <Typography variant="body2" color="textSecondary">
                <strong>Notes:</strong> {order.notes}
              </Typography>
            </Box>
          )}
        </Collapse>

        {/* Action buttons */}
        <Divider className="divider" />
        <Box className="action-buttons">
          {allowAcceptReject && order.status === "pending" && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleAccept}
                disabled={isLoading || statusUpdateLoading}
                className="action-button"
              >
                {isLoading || statusUpdateLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Accept"
                )}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleDecline}
                disabled={isLoading || statusUpdateLoading}
                className="action-button"
              >
                {isLoading || statusUpdateLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Decline"
                )}
              </Button>
            </>
          )}
          {allowKOT &&
            (order.status === "accepted" ||
              order.status === "kot-generated" ||
              order.status === "completed") && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handleGenerateKOT}
                disabled={isLoading || kotGenerationLoading}
                className="action-button"
              >
                {isLoading || kotGenerationLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Generate KOT"
                )}
              </Button>
            )}
          {allowComplete &&
            (order.status === "accepted" ||
              order.status === "kot-generated") && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkCompleted}
                disabled={isLoading || statusUpdateLoading}
                className="action-button"
              >
                {isLoading || statusUpdateLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Mark Completed"
                )}
              </Button>
            )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TakeawayOrderCard;
