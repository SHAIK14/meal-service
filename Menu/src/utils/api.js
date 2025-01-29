// menu-project/src/utils/api.js
const BASE_URL = "http://localhost:5000/api/dining-menu";

export const validateQRAccess = async (pincode, tableName) => {
  try {
    console.log("Making validation request for:", { pincode, tableName });
    const response = await fetch(
      `${BASE_URL}/validate/${pincode}/${tableName}`
    );
    const data = await response.json();
    console.log("Validation API response:", data);
    return data;
  } catch (error) {
    console.error("Error validating access:", error);
    return { success: false, message: "Failed to validate access" };
  }
};

// Fetch menu items for a branch
export const getDiningMenuItems = async (branchId) => {
  try {
    const response = await fetch(`${BASE_URL}/menu/${branchId}`);
    const data = await response.json();
    console.log("Menu Items API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return { success: false, message: "Failed to fetch menu items" };
  }
};

// Get detailed item information
export const getMenuItemDetails = async (branchId, itemId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/menu/${branchId}/items/${itemId}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching item details:", error);
    return { success: false, message: "Failed to fetch item details" };
  }
};

// Create dining order
export const createDiningOrder = async (orderData) => {
  try {
    console.log("Creating order with data:", orderData);
    const response = await fetch(`${BASE_URL}/dining-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    console.log("Order creation response:", data);
    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, message: "Failed to create order" };
  }
};
export const requestPayment = async (sessionId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/sessions/${sessionId}/request-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error requesting payment:", error);
    return { success: false, message: "Failed to request payment" };
  }
};
export const getSessionOrders = async (sessionId) => {
  try {
    const response = await fetch(`${BASE_URL}/sessions/${sessionId}/orders`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching session orders:", error);
    return { success: false, message: "Failed to fetch orders" };
  }
};
// Add items to an existing order
export const addItemsToOrder = async (orderId, items) => {
  try {
    const response = await fetch(
      `${BASE_URL}/dining-orders/${orderId}/add-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding items to order:", error);
    return { success: false, message: "Failed to add items to order" };
  }
};
// Fetch orders for a branch
export const getBranchOrders = async (branchId) => {
  try {
    const response = await fetch(`${BASE_URL}/kitchen/orders/${branchId}`);
    const data = await response.json();
    console.log("Branch Orders API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching branch orders:", error);
    return { success: false, message: "Failed to fetch branch orders" };
  }
};
