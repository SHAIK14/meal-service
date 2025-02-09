// src/contexts/DiningContext.jsx
import React, { createContext, useContext, useState } from "react";

const DiningContext = createContext(undefined);

export function DiningProvider({ children }) {
  const [branchDetails, setBranchDetails] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [orders, setOrders] = useState([]);

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

  // Update branch and session details
  const updateBranchDetails = (response) => {
    if (!response?.branch) return;

    setBranchDetails({
      id: response.branch.id,
      name: response.branch.name,
      address: response.branch.address,
      coordinates: response.branch.coordinates,
      diningRadius: response.branch.diningRadius,
      tableName: window.location.pathname.split("/").pop(),
    });

    // Update session if exists
    if (response.session) {
      setSessionDetails({
        id: response.session.id,
        totalAmount: response.session.totalAmount,
        paymentRequested: response.session.paymentRequested,
      });
      setOrders(response.session.orders || []);
    }
  };

  // Function to update orders
  const updateOrders = (newOrders) => {
    setOrders(newOrders);
  };

  // Function to update session details
  const updateSessionDetails = (details) => {
    setSessionDetails((prevSession) => ({
      ...prevSession,
      ...details,
    }));
  };

  const value = {
    branchDetails,
    setBranchDetails: updateBranchDetails,
    currentCategory,
    setCurrentCategory,
    getUserLocation,
    sessionDetails,
    updateSessionDetails,
    orders,
    updateOrders,
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
