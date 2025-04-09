// src/contexts/DiningContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

const DiningContext = createContext(undefined);

export function DiningProvider({ children }) {
  const [branchDetails, setBranchDetails] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

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

  // Set up Socket connection when branch details are available
  useEffect(() => {
    if (branchDetails?.id && branchDetails?.tableName) {
      console.log("Setting up socket connection for branch:", branchDetails.id);

      // Create socket connection
      const newSocket = io("http://localhost:5000");

      // Set up event listeners
      newSocket.on("connect", () => {
        console.log("Socket connected! Socket ID:", newSocket.id);
        setIsConnected(true);

        // Join the table-specific room
        newSocket.emit("joinTable", {
          branchId: branchDetails.id,
          tableName: branchDetails.tableName,
        });
        console.log(`Joining table room for: ${branchDetails.tableName}`);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected!");
        setIsConnected(false);
      });

      // Listen for order status updates
      newSocket.on("order_status_updated", (data) => {
        console.log("Received order status update:", data);
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
      });

      // Listen for session completion
      newSocket.on("session_completed", (data) => {
        console.log("Session completed:", data);
        if (sessionDetails?.id === data.sessionId) {
          setSessionDetails((prev) => ({ ...prev, status: "completed" }));
          alert("Your dining session has been completed by the restaurant.");
        }
      });

      setSocket(newSocket);

      // Cleanup function
      return () => {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [branchDetails?.id, branchDetails?.tableName]);

  // Update branch and session details
  const updateBranchDetails = (response) => {
    console.log("Updating branch details:", response?.branch?.id);
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
      console.log("Setting session details:", response.session.id);
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
    console.log("Manually updating orders:", newOrders.length);
    setOrders(newOrders);
  };

  // Function to update session details
  const updateSessionDetails = (details) => {
    console.log("Updating session details:", details);
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
    socket,
    isConnected,
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
