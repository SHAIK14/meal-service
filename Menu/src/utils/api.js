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
