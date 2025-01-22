// menu-project/src/utils/api.js
const BASE_URL = "http://localhost:5000/api/dining-menu";

export const validateQRAccess = async (pincode, tableName) => {
  try {
    const response = await fetch(
      `${BASE_URL}/validate/${pincode}/${tableName}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error validating access:", error);
    return { success: false, message: "Failed to validate access" };
  }
};

// Fetch menu items for a branch
export const getDiningMenuItems = async (branchId) => {
  try {
    const response = await fetch(`${BASE_URL}/menu/${branchId}`);
    return await response.json();
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
    const response = await fetch(`${BASE_URL}/dining-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, message: "Failed to create order" };
  }
};
