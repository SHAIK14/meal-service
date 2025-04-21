// src/contexts/DiningContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

const DiningContext = createContext(undefined);

export function DiningProvider({ children }) {
  const [branchDetails, setBranchDetails] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

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

        // Map backend status to customer-friendly status
        let customerStatus = data.status;
        if (data.status === "admin_approved") customerStatus = "accepted";
        if (
          data.status === "in_preparation" ||
          data.status === "ready_for_pickup"
        )
          customerStatus = "preparing";

        setOrders((prevOrders) => {
          // Create a new array with the updated status
          const updatedOrders = prevOrders.map((order) =>
            order._id === data.orderId
              ? {
                  ...order,
                  status: customerStatus,
                  // Also update statusTimestamps if available
                  statusTimestamps: data.timestamp
                    ? {
                        ...order.statusTimestamps,
                        [customerStatus]: data.timestamp,
                      }
                    : order.statusTimestamps,
                }
              : order
          );

          console.log(
            "Updated orders after status change:",
            updatedOrders.map((o) => `${o._id}: ${o.status}`)
          );
          return updatedOrders;
        });
      });

      // Listen for item cancellations and returns with improved error handling
      newSocket.on("order_item_cancelled", (data) => {
        console.log("Item cancelled event received:", data);
        handleItemAction(data, "cancel");
      });

      newSocket.on("order_item_returned", (data) => {
        console.log("Item returned event received:", data);
        handleItemAction(data, "return");
      });

      // Generic order update event with more comprehensive handling
      newSocket.on("order_updated", (data) => {
        console.log("Order updated event received:", data);
        if (data.orderId) {
          setOrders((prevOrders) => {
            const updatedOrders = prevOrders.map((order) => {
              if (order._id === data.orderId) {
                // Return updated order with possibly new items array and total
                const updatedOrder = {
                  ...order,
                  totalAmount:
                    data.totalAmount !== undefined
                      ? data.totalAmount
                      : order.totalAmount,
                };

                // Only update items if they were provided
                if (data.items) {
                  updatedOrder.items = data.items;
                }

                // Update status if provided
                if (data.status) {
                  // Map backend status to customer-friendly status
                  let customerStatus = data.status;
                  if (data.status === "admin_approved")
                    customerStatus = "accepted";
                  if (
                    data.status === "in_preparation" ||
                    data.status === "ready_for_pickup"
                  )
                    customerStatus = "preparing";

                  updatedOrder.status = customerStatus;
                }

                return updatedOrder;
              }
              return order;
            });

            return updatedOrders;
          });

          // Update session total if provided
          if (data.sessionTotal !== undefined && sessionDetails) {
            updateSessionDetails({
              ...sessionDetails,
              totalAmount: data.sessionTotal,
            });
          }
        }
      });

      // Improved handler for session completion
      newSocket.on("session_completed", (data) => {
        console.log("Session completed:", data);
        if (sessionDetails?.id === data.sessionId) {
          setSessionDetails((prev) => ({ ...prev, status: "completed" }));
          // Provide more informative alert
          alert(
            "Your dining session has been completed by the restaurant staff. Thank you for dining with us!"
          );
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

  // Handle item cancellation/return events
  const handleItemAction = (data, actionType) => {
    console.log(`Processing ${actionType} for item in order ${data.orderId}`);

    setOrders((prevOrders) => {
      // Find the order that needs to be updated
      const updatedOrders = prevOrders.map((order) => {
        if (order._id === data.orderId) {
          // Find the specific item within the order
          const updatedItems = [...order.items];

          // Make sure itemIndex is valid
          if (data.itemIndex >= 0 && data.itemIndex < updatedItems.length) {
            // Update the item with new cancelled/returned quantity
            if (actionType === "cancel") {
              updatedItems[data.itemIndex] = {
                ...updatedItems[data.itemIndex],
                cancelledQuantity:
                  (updatedItems[data.itemIndex].cancelledQuantity || 0) +
                  data.quantity,
                cancelReason: data.reason,
                cancelledAt: new Date(),
              };
            } else {
              // return
              updatedItems[data.itemIndex] = {
                ...updatedItems[data.itemIndex],
                returnedQuantity:
                  (updatedItems[data.itemIndex].returnedQuantity || 0) +
                  data.quantity,
                returnReason: data.reason,
                returnedAt: new Date(),
              };
            }
          } else {
            console.warn(
              `Invalid itemIndex: ${data.itemIndex} for order ${data.orderId}`
            );
          }

          // Return updated order with new items and total
          return {
            ...order,
            items: updatedItems,
            totalAmount:
              data.newOrderTotal !== undefined
                ? data.newOrderTotal
                : order.totalAmount,
          };
        }
        return order;
      });

      return updatedOrders;
    });

    // Update session total if provided
    if (data.newSessionTotal !== undefined && sessionDetails) {
      updateSessionDetails({
        ...sessionDetails,
        totalAmount: data.newSessionTotal,
      });
    }
  };

  // Update branch and session details
  // In DiningContext.jsx - update the updateBranchDetails function

  const updateBranchDetails = (response) => {
    console.log("Full response from server:", response);
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

    // If session exists, update session details
    if (response.session) {
      console.log(
        "Setting session details from server response:",
        response.session
      );

      // Check if session PIN is missing and try to get it from localStorage
      let sessionPin = response.session.pin;
      if (!sessionPin) {
        console.log("PIN not found in server response, checking localStorage");
        try {
          const savedAuth = localStorage.getItem(
            `session_${response.session.id}`
          );
          if (savedAuth) {
            const auth = JSON.parse(savedAuth);
            if (auth.pin) {
              console.log("Found PIN in localStorage:", auth.pin);
              sessionPin = auth.pin;
            }
          }
        } catch (e) {
          console.error("Error reading PIN from localStorage:", e);
        }
      }

      setSessionDetails({
        id: response.session.id,
        totalAmount: response.session.totalAmount,
        paymentRequested: response.session.paymentRequested,
        customerName: response.session.customerName,
        pin: sessionPin, // Now using PIN from localStorage if not in response
      });

      // Log PIN status
      if (sessionPin) {
        console.log("PIN set in session details:", sessionPin);
      } else {
        console.warn("No PIN available for session");
      }

      // Map order statuses to customer-friendly versions
      const mappedOrders = response.session.orders.map((order) => {
        let status = order.status;
        if (status === "admin_approved") status = "accepted";
        if (status === "in_preparation" || status === "ready_for_pickup")
          status = "preparing";

        return {
          ...order,
          status,
        };
      });

      // Sort orders by creation date (newest first)
      mappedOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(mappedOrders || []);
    } else {
      // Show booking modal if no session exists
      setShowBookingModal(true);
    }
  };

  const handleSessionStarted = (session) => {
    console.log("Session started with details:", session); // Debug log
    if (session) {
      setSessionDetails({
        id: session.id,
        totalAmount: session.totalAmount || 0,
        paymentRequested: session.paymentRequested || false,
        customerName: session.customerName,
        pin: session.pin, // Make sure PIN is included here!
      });
      console.log("Session details set with PIN:", session.pin); // Debug log
      setShowBookingModal(false);
    }
  };
  // Function to update orders
  const updateOrders = (newOrders) => {
    console.log(
      "Updating orders:",
      Array.isArray(newOrders) ? newOrders.length : "not an array"
    );

    if (Array.isArray(newOrders)) {
      // Map backend statuses to customer-friendly ones
      const mappedOrders = newOrders.map((order) => {
        let status = order.status;
        if (status === "admin_approved") status = "accepted";
        if (status === "in_preparation" || status === "ready_for_pickup")
          status = "preparing";

        return {
          ...order,
          status,
        };
      });

      // Sort by creation date if we have a timestamp
      if (mappedOrders.length > 0 && mappedOrders[0].createdAt) {
        mappedOrders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      setOrders(mappedOrders);
    }
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
    showBookingModal,
    setShowBookingModal,
    handleSessionStarted,
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
