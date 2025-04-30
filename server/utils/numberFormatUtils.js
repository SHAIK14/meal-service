const DiningOrder = require("../models/menu/DiningOrder");

// Generate a standardized order number with daily reset
const generateOrderNumber = async (branchId) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD

  // Find the latest order for today to determine sequence number
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const latestOrder = await DiningOrder.findOne({
    branchId,
    createdAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (latestOrder && latestOrder.orderNumber) {
    // Extract sequence from existing order number
    const match = latestOrder.orderNumber.match(/ORD-\d{6}-(\d{3})/);
    if (match && match[1]) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  // Pad sequence with leading zeros
  const paddedSequence = sequence.toString().padStart(3, "0");
  return `ORD-${dateStr}-${paddedSequence}`;
};

// Generate a standardized invoice number
const generateInvoiceNumber = (sessionId) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD

  // Use last 4 chars of session ID for uniqueness
  const sessionSuffix = sessionId.slice(-4);

  return `INV-${dateStr}-${sessionSuffix}`;
};

module.exports = {
  generateOrderNumber,
  generateInvoiceNumber,
};
