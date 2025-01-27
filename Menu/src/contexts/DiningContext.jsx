// src/contexts/DiningContext.jsx
import React, { createContext, useContext, useState } from "react";

const DiningContext = createContext(undefined);

export function DiningProvider({ children }) {
  const [branchDetails, setBranchDetails] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Function to get user's location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Simple update function that ensures the structure is correct
  const updateBranchDetails = (response) => {
    if (!response?.branch) return;
    setBranchDetails({
      id: response.branch.id,
      name: response.branch.name,
      address: response.branch.address,
      tableName: window.location.pathname.split("/").pop(),
    });
  };

  const value = {
    branchDetails,
    setBranchDetails: updateBranchDetails,
    currentCategory,
    setCurrentCategory,
    getUserLocation,
  };

  return (
    <DiningContext.Provider value={value}>{children}</DiningContext.Provider>
  );
}

export function useDining() {
  const context = useContext(DiningContext);
  if (!context) {
    throw new Error("useDining must be used within a DiningProvider");
  }
  return context;
}
