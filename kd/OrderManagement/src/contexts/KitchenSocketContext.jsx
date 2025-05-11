import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { getPendingOrders } from "../utils/api"; // Import the new API function

const KitchenSocketContext = createContext();

export function KitchenSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInKitchenRoom, setIsInKitchenRoom] = useState(false);
  const [newOrderEvents, setNewOrderEvents] = useState([]);
  const [orderStatusEvents, setOrderStatusEvents] = useState([]);
  const [tableStatusEvents, setTableStatusEvents] = useState([]);
  const [paymentRequestEvents, setPaymentRequestEvents] = useState([]);
  const [isLoadingPendingOrders, setIsLoadingPendingOrders] = useState(false);
  
  // Keep track of connection attempts
  const connectionAttempts = useRef(0);
  const lastJoinAttempt = useRef(0);
  const hasFetchedPendingOrders = useRef(false);

  // Function to fetch pending orders - DEFINE THIS FIRST before using it
  const fetchPendingOrders = async () => {
    console.log("🔍 DEBUG: fetchPendingOrders function called");
    // Skip if we've already fetched or are currently loading
    if (hasFetchedPendingOrders.current || isLoadingPendingOrders) {
      console.log("🔍 DEBUG: Skipping fetchPendingOrders - already fetched or loading");
      return;
    }
    
    try {
      setIsLoadingPendingOrders(true);
      console.log("🔄 Fetching pending orders...");
      
      console.log("🔍 DEBUG: About to call getPendingOrders API");
      const response = await getPendingOrders();
      console.log("🔍 DEBUG: API response:", response);
      
      if (response.success && response.data) {
        const pendingOrders = response.data;
        console.log(`🔄 Found ${pendingOrders.length} pending orders`);
        
        if (pendingOrders.length > 0) {
          // Process each pending order
          pendingOrders.forEach(order => {
            // Format order as a socket event
            const orderEvent = {
              orderId: order._id,
              tableName: order.tableName,
              status: order.status,
              items: order.items,
              totalAmount: order.totalAmount,
              createdAt: order.createdAt
            };
            
            // Add to newOrderEvents state
            setNewOrderEvents(prev => {
              // Skip if this order ID already exists
              if (prev.some(o => o.orderId === order._id)) {
                return prev;
              }
              return [...prev, orderEvent];
            });
          });
          
          console.log("🔄 Added pending orders to the notification queue");
        }
        
        // Mark as fetched
        hasFetchedPendingOrders.current = true;
      }
    } catch (error) {
      console.error("❌ Error fetching pending orders:", error);
      console.log("🔍 DEBUG: Error details:", error.message, error.stack);
    } finally {
      setIsLoadingPendingOrders(false);
    }
  };

  // Get branch ID from localStorage without hardcoding
  const getBranchId = () => {
    const branchId = localStorage.getItem("branchId");
    if (branchId) {
      return branchId;
    }
    console.warn("No branchId found in localStorage - socket connections may not work properly");
    return null;
  };

  // Join kitchen room function - can be called repeatedly
  const joinKitchenRoom = (socket, branchId) => {
    if (!socket || !socket.connected) {
      console.warn("Cannot join kitchen room - socket not connected");
      return false;
    }
    
    if (!branchId) {
      console.warn("Cannot join kitchen room - no branchId provided");
      return false;
    }
    
    // Prevent too many join attempts in a short period
    const now = Date.now();
    if (now - lastJoinAttempt.current < 2000) {
      console.log("Throttling join attempts");
      return false;
    }
    
    lastJoinAttempt.current = now;
    connectionAttempts.current += 1;
    
    console.log(`Joining kitchen room for branch: ${branchId} (attempt #${connectionAttempts.current})`);
    
    // Join kitchen room with explicit client type
    socket.emit("joinKitchen", { 
      branchId,
      clientType: "kitchen" // Important - identifies this as a kitchen client
    }, (response) => {
      if (response && response.success) {
        console.log(`Successfully joined kitchen room for branch ${branchId} with ${response.socketCount} client(s)`);
        setIsInKitchenRoom(true);
        
        // Fetch pending orders after successful room join
        console.log("🔍 DEBUG: Successfully joined kitchen room, about to fetch pending orders");
        fetchPendingOrders(); // Call it here, not at module level
        console.log("🔍 DEBUG: Called fetchPendingOrders()");
      } else {
        console.error("Failed to join kitchen room:", response?.message || "Unknown error");
        setIsInKitchenRoom(false);
        
        // Schedule retry after delay if connection fails
        setTimeout(() => {
          if (socket.connected) {
            console.log("Retrying kitchen room join after failure");
            joinKitchenRoom(socket, branchId);
          }
        }, 3000);
      }
    });
    
    return true;
  };
  
  // Function to check if we're in the kitchen room
  const checkKitchenRoomStatus = (socket, branchId) => {
    if (!socket || !socket.connected || !branchId) return;
    
    socket.emit("check_room_status", { branchId }, (response) => {
      if (response && response.success) {
        console.log("Room status check:", response);
        setIsInKitchenRoom(response.inKitchenRooms);
        
        // If not in kitchen room, rejoin
        if (!response.inKitchenRooms) {
          console.log("Not in kitchen room, rejoining...");
          joinKitchenRoom(socket, branchId);
        } else {
          console.log(`In kitchen room with ${response.kitchenRoomClients} client(s)`);
        }
      }
    });
  };

  // Force rejoin kitchen room - useful for debugging
  const forceRejoinKitchen = () => {
    const currentSocket = socket;
    const branchId = getBranchId();
    
    if (!currentSocket || !branchId) {
      console.error("Cannot force rejoin - socket or branchId missing");
      return false;
    }
    
    console.log(`Force rejoining kitchen room for branch ${branchId}`);
    
    currentSocket.emit("force_rejoin_kitchen", { branchId }, (response) => {
      console.log("Force rejoin response:", response);
      if (response && response.success) {
        setIsInKitchenRoom(true);
        fetchPendingOrders();
      }
    });
    
    return true;
  };

  // REMOVE THESE LINES - they're causing the error
  // console.log("🔍 DEBUG: Successfully joined kitchen room, about to fetch pending orders");
  // fetchPendingOrders(); // This is the problematic line
  // console.log("🔍 DEBUG: Called fetchPendingOrders()");

  // Reset fetch status when disconnected
  useEffect(() => {
    if (!isConnected) {
      hasFetchedPendingOrders.current = false;
    }
  }, [isConnected]);

  useEffect(() => {
    // Get branchId from localStorage
    const branchId = getBranchId();
    
    console.log("Initializing kitchen socket for branch:", branchId);

    // Create socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
    const newSocket = io(socketUrl);

    // Handle connection events
    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id);
      setIsConnected(true);
      connectionAttempts.current = 0;

      // Get the latest branchId when connecting
      const currentBranchId = getBranchId();
      
      if (currentBranchId) {
        // Join kitchen room for this branch
        joinKitchenRoom(newSocket, currentBranchId);
        
        // Set up periodic room status checks
        const intervalId = setInterval(() => {
          if (newSocket.connected) {
            checkKitchenRoomStatus(newSocket, currentBranchId);
          }
        }, 30000); // Check every 30 seconds
        
        // Clear interval on cleanup
        return () => clearInterval(intervalId);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setIsInKitchenRoom(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
    
    // Handle kitchen room join confirmation
    newSocket.on("kitchen_room_joined", (data) => {
      console.log("Kitchen room join confirmed:", data);
      setIsInKitchenRoom(true);
      
      // Fetch pending orders after successful room join
      fetchPendingOrders();
    });

    // Event handlers
    newSocket.on("new_order", (data) => {
      console.log("New order received:", data);
      
      // Add new order to state
      setNewOrderEvents((prev) => {
        // Avoid duplicates
        const exists = prev.some(order => order.orderId === data.orderId);
        
        if (!exists) {
          // Make a deep copy to avoid reference issues
          const orderCopy = JSON.parse(JSON.stringify(data));
          return [...prev, orderCopy];
        }
        
        return prev;
      });
    });

    newSocket.on("order_status_updated", (data) => {
      console.log("Order status updated:", data);
      setOrderStatusEvents((prev) => [...prev, data]);
    });

    newSocket.on("table_status_updated", (data) => {
      console.log("Table status updated:", data);
      setTableStatusEvents((prev) => [...prev, data]);
    });

    newSocket.on("payment_requested", (data) => {
      console.log("Payment requested:", data);
      setPaymentRequestEvents((prev) => [...prev, data]);
    });
    
    // Debug response handler
    newSocket.on("debug_response", (data) => {
      console.log("Debug response:", data);
    });
    
    // Force rejoin response
    newSocket.on("force_rejoin_response", (data) => {
      console.log("Force rejoin response:", data);
      if (data && data.success) {
        setIsInKitchenRoom(true);
      }
    });

    // Store socket in state
    setSocket(newSocket);

    // Add a listener for branchId changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === "branchId" && newSocket.connected) {
        const newBranchId = e.newValue;
        
        if (newBranchId) {
          console.log(`BranchId changed to ${newBranchId}, rejoining kitchen room`);
          joinKitchenRoom(newSocket, newBranchId);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      console.log("Cleaning up socket connection");
      window.removeEventListener("storage", handleStorageChange);
      newSocket.disconnect();
    };
  }, []); // Empty dependency array - only run once

  // Event clearing functions
  const clearNewOrderEvents = () => {
    console.log(`Clearing ${newOrderEvents.length} new order events`);
    setNewOrderEvents([]);
  };
  
  const clearOrderStatusEvents = () => setOrderStatusEvents([]);
  const clearTableStatusEvents = () => setTableStatusEvents([]);
  const clearPaymentRequestEvents = () => setPaymentRequestEvents([]);

  const value = {
    socket,
    isConnected,
    isInKitchenRoom,
    newOrderEvents,
    orderStatusEvents,
    tableStatusEvents,
    paymentRequestEvents,
    clearNewOrderEvents,
    clearOrderStatusEvents,
    clearTableStatusEvents,
    clearPaymentRequestEvents,
    forceRejoinKitchen,
    checkKitchenRoomStatus,
    fetchPendingOrders,
    isLoadingPendingOrders
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