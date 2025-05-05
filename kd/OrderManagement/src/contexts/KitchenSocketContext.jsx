// src/contexts/KitchenSocketContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

const KitchenSocketContext = createContext();

export function KitchenSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderEvents, setNewOrderEvents] = useState([]);
  const [orderStatusEvents, setOrderStatusEvents] = useState([]);
  const [tableStatusEvents, setTableStatusEvents] = useState([]);
  const [paymentRequestEvents, setPaymentRequestEvents] = useState([]);

  // Get branch ID from localStorage
  const branchId = localStorage.getItem("branchId");

  useEffect(() => {
    if (!branchId) return;

    console.log("Initializing kitchen socket connection for branch:", branchId);
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      console.log("Kitchen socket connected! Socket ID:", newSocket.id);
      setIsConnected(true);

      // Join kitchen room for this branch
      newSocket.emit("joinKitchen", { branchId });
      console.log(`Joining kitchen room for branch: ${branchId}`);
    });

    newSocket.on("disconnect", () => {
      console.log("Kitchen socket disconnected!");
      setIsConnected(false);
    });

    // Set up event listeners
    newSocket.on("new_order", (data) => {
      console.log("New order received:", data);
      setNewOrderEvents((prev) => [...prev, data]);
    });

    newSocket.on("order_status_updated", (data) => {
      console.log("Order status update received:", data);
      setOrderStatusEvents((prev) => [...prev, data]);
    });

    newSocket.on("table_status_updated", (data) => {
      console.log("Table status update received:", data);
      setTableStatusEvents((prev) => [...prev, data]);
    });

    newSocket.on("payment_requested", (data) => {
      console.log("Payment request received:", data);
      setPaymentRequestEvents((prev) => [...prev, data]);
    });

    // Add handler for order_updated event
    newSocket.on("order_updated", (data) => {
      console.log("Order updated event received:", data);

      if (data.items) {
        console.log("Updated order items:", data.items);
      }

      // Force refresh of orders
      if (typeof window.fetchKitchenOrders === "function") {
        window.fetchKitchenOrders();
      }
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up kitchen socket connection");
      newSocket.disconnect();
    };
  }, [branchId]);

  // Clear specific events after consumption
  const clearNewOrderEvents = () => setNewOrderEvents([]);
  const clearOrderStatusEvents = () => setOrderStatusEvents([]);
  const clearTableStatusEvents = () => setTableStatusEvents([]);
  const clearPaymentRequestEvents = () => setPaymentRequestEvents([]);

  const value = {
    socket,
    isConnected,
    newOrderEvents,
    orderStatusEvents,
    tableStatusEvents,
    paymentRequestEvents,
    clearNewOrderEvents,
    clearOrderStatusEvents,
    clearTableStatusEvents,
    clearPaymentRequestEvents,
  };

  return (
    <KitchenSocketContext.Provider value={value}>
      {children}
    </KitchenSocketContext.Provider>
  );
}

export function useKitchenSocket() {
  const context = useContext(KitchenSocketContext);
  if (!context) {
    throw new Error(
      "useKitchenSocket must be used within a KitchenSocketProvider"
    );
  }
  return context;
}
