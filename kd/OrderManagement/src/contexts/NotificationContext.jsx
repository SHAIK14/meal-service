import React, { createContext, useContext, useState, useEffect } from 'react';
import { useKitchenSocket } from './KitchenSocketContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // Notifications state with deduplication tracking
  const [notifications, setNotifications] = useState(() => {
    // Load from localStorage on init
    try {
      const saved = localStorage.getItem('restaurantNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing stored notifications:", e);
      return [];
    }
  });
  
  // Keep track of processed order IDs to prevent duplicates
  const [processedOrderIds] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get socket events from KitchenSocketContext
  const { 
    socket,
    newOrderEvents, 
    orderStatusEvents, 
    tableStatusEvents, 
    paymentRequestEvents,
    clearNewOrderEvents,
    clearOrderStatusEvents,
    clearTableStatusEvents,
    clearPaymentRequestEvents
  } = useKitchenSocket();
  
  // Calculate unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(item => !item.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Handle new order notifications with deduplication
  useEffect(() => {
    console.log("🔵 newOrderEvents in NotificationContext:", newOrderEvents);
    console.log("🔵 Current newOrderEvents length:", newOrderEvents.length);
    
    if (newOrderEvents.length > 0) {
      // Create a temporary set of newly processed orders
      const newlyProcessedIds = new Set();
      
      // Filter out orders we've already processed AND orders that are already approved
      const newNotifications = newOrderEvents
        .filter(order => {
          // Ensure we have a valid order ID
          if (!order.orderId) {
            console.warn("🔵 Order without ID received:", order);
            return false;
          }
          
          // Check if we've already processed this order
          if (processedOrderIds.has(order.orderId)) {
            console.log(`🔵 Order ${order.orderId} already processed, skipping`);
            return false;
          }
          
          // Skip admin_approved orders - important to avoid duplicate notifications
          if (order.status === 'admin_approved') {
            console.log(`🔵 Order ${order.orderId} is already approved, not creating notification`);
            processedOrderIds.add(order.orderId); // Still mark as processed
            return false;
          }
          
          // Add to newly processed set
          newlyProcessedIds.add(order.orderId);
          return true;
        })
        .map(order => {
          console.log("🔵 Creating notification for order:", order);
          // Create a notification for new pending orders
          return {
            id: `order-${order.orderId}-${Date.now()}`,
            type: 'new_order',
            title: `New Order at Table ${order.tableName}`,
            tableName: order.tableName,
            orderId: order.orderId,
            items: order.items?.length || 0,
            timestamp: new Date(),
            read: false,
            data: order
          };
        });
      
      // Add newly processed IDs to our master set
      newlyProcessedIds.forEach(id => {
        processedOrderIds.add(id);
      });
      
      if (newNotifications.length > 0) {
        console.log(`🔵 Adding ${newNotifications.length} unique notifications:`, newNotifications);
        addNotifications(newNotifications);
      }
      
      // Clear processed events after a short delay to ensure they're processed
      setTimeout(() => {
        clearNewOrderEvents();
        console.log("🔵 Cleared newOrderEvents");
      }, 500);
    }
  }, [newOrderEvents, clearNewOrderEvents, processedOrderIds]);
  
  // Handle order status change notifications with deduplication
  useEffect(() => {
    if (orderStatusEvents.length > 0) {
      console.log("🟢 Processing order status events:", orderStatusEvents);
      
      // Only create notifications for "ready_for_pickup" status
      const statusNotifications = orderStatusEvents
        .filter(event => event.status === "ready_for_pickup")
        .map(event => ({
          id: `status-${event.orderId}-${Date.now()}`,
          type: 'ready_for_pickup',
          title: `Order Ready at Table ${event.tableName}`,
          tableName: event.tableName,
          orderId: event.orderId,
          timestamp: new Date(),
          read: false,
          data: event
        }));
      
      if (statusNotifications.length > 0) {
        console.log("🟢 Adding status notifications:", statusNotifications);
        addNotifications(statusNotifications);
      }
      
      clearOrderStatusEvents(); // Clear processed events
    }
  }, [orderStatusEvents, clearOrderStatusEvents]);
  
  // Handle payment request notifications
  useEffect(() => {
    if (paymentRequestEvents.length > 0) {
      console.log("💰 Processing payment request events:", paymentRequestEvents);
      
      const paymentNotifications = paymentRequestEvents.map(event => ({
        id: `payment-${event.sessionId}-${Date.now()}`,
        type: 'payment_request',
        title: `Payment Requested at Table ${event.tableName}`,
        tableName: event.tableName,
        sessionId: event.sessionId,
        totalAmount: event.totalAmount,
        timestamp: new Date(),
        read: false,
        data: event
      }));
      
      console.log("💰 Adding payment notifications:", paymentNotifications);
      addNotifications(paymentNotifications);
      clearPaymentRequestEvents(); // Clear processed events
    }
  }, [paymentRequestEvents, clearPaymentRequestEvents]);
  
  // Add notifications to state
  const addNotifications = (newItems) => {
    if (!newItems || newItems.length === 0) {
      console.log("No new notifications to add");
      return;
    }
    
    console.log(`Adding ${newItems.length} new notifications`);
    
    setNotifications(prev => {
      // Add new items at the beginning
      const updated = [...newItems, ...prev];
      // Limit to 50 notifications
      const limited = updated.slice(0, 50);
      // Save to localStorage
      try {
        localStorage.setItem('restaurantNotifications', JSON.stringify(limited));
      } catch (e) {
        console.error("Error saving notifications to localStorage:", e);
      }
      return limited;
    });
    
    // Play notification sound if available
    const audio = document.getElementById("notification-sound");
    if (audio) {
      // Reset the audio to the beginning before playing
      audio.currentTime = 0;
      
      // Use a better error handling approach
      audio.play().catch((e) => {
        if (e.name === "NotSupportedError") {
          console.error("Audio format not supported. Make sure notification.mp3 exists in public folder");
        } else if (e.name === "NotAllowedError") {
          console.warn("User interaction required before audio can play");
        } else {
          console.error("Error playing sound:", e);
        }
      });
    } else {
      console.warn("Notification sound element not found");
    }
  };
  
  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(item => 
        item.id === notificationId ? { ...item, read: true } : item
      );
      localStorage.setItem('restaurantNotifications', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(item => ({ ...item, read: true }));
      localStorage.setItem('restaurantNotifications', JSON.stringify(updated));
      return updated;
    });
  };
  
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(item => item.id !== notificationId);
      localStorage.setItem('restaurantNotifications', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('restaurantNotifications');
  };
  
  // Get notifications by type
  const getNotificationsByType = (type) => {
    if (!type || type === 'all') return notifications;
    return notifications.filter(item => item.type === type);
  };
  
  // Value to provide
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotificationsByType,
    removeNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}