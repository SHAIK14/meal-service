import React, { createContext, useContext, useState, useEffect } from 'react';
import { useKitchenSocket } from './KitchenSocketContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // Notifications state with deduplication tracking
  const [notifications, setNotifications] = useState(() => {
    // Load from localStorage on init
    try {
      const saved = localStorage.getItem('restaurantNotifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out notifications from previous days
        const today = new Date().setHours(0, 0, 0, 0);
        return parsed.filter(notification => {
          const notificationDate = new Date(notification.timestamp).setHours(0, 0, 0, 0);
          return notificationDate >= today;
        });
      }
      return [];
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
          
          // Create item summary for display
          const itemsSummary = order.items
            ?.slice(0, 3)
            .map(item => `${item.quantity} ${item.name || 'item'}`)
            .join(', ');
          
          // Add "and X more" if there are more items
          const itemsText = order.items?.length > 3 
            ? `${itemsSummary} and ${order.items.length - 3} more` 
            : itemsSummary;
          
          // Create a notification for new pending orders
          return {
            id: `order-${order.orderId}-${Date.now()}`,
            type: 'new_order',
            title: `New Order at Table ${order.tableName}`,
            tableName: order.tableName,
            orderId: order.orderId,
            items: order.items?.length || 0,
            itemsSummary: itemsText, // Add summary for display
            timestamp: new Date(),
            read: false,
            processed: false, // Track if this notification has been actioned
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
// Handle order status change notifications with deduplication
useEffect(() => {
  if (orderStatusEvents.length > 0) {
    console.log("🟢 Processing order status events:", orderStatusEvents);
    
    // Process status updates and mark notifications as processed accordingly
    orderStatusEvents.forEach(event => {
      // If this is an order that was approved or served, find and mark its notification as processed
      if (event.status === "admin_approved" || event.status === "served") {
        setNotifications(prev => {
          return prev.map(notification => {
            // If this notification is for the same order and hasn't been processed yet
            if (notification.orderId === event.orderId && !notification.processed) {
              return {
                ...notification,
                processed: true,
                read: true
              };
            }
            return notification;
          });
        });
      }
      
      // Only create new notifications for "ready_for_pickup" status
      if (event.status === "ready_for_pickup") {
        const readyNotification = {
          id: `status-${event.orderId}-${Date.now()}`,
          type: 'ready_for_pickup',
          title: `Order Ready at Table ${event.tableName}`,
          tableName: event.tableName,
          orderId: event.orderId,
          timestamp: new Date(),
          read: false,
          processed: false,
          data: event
        };
        
        addNotifications([readyNotification]);
      }
    });
    
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
        processed: false,
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
  
  // Mark a notification as processed (action taken)
  const markAsProcessed = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(item => 
        item.id === notificationId ? { ...item, processed: true, read: true } : item
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
  
  // Clear notifications by type (mark as read)
  const clearNotificationsByType = (type) => {
    if (!type || type === 'all') return;
    
    setNotifications(prev => {
      const updated = prev.map(item => 
        item.type === type ? { ...item, read: true } : item
      );
      localStorage.setItem('restaurantNotifications', JSON.stringify(updated));
      return updated;
    });
  };
  
// Remove a notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(item => item.id !== notificationId);
      localStorage.setItem('restaurantNotifications', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Remove notifications by type and processed status
  const removeNotificationsByType = (type, processedOnly = false) => {
    setNotifications(prev => {
      let updated;
      
      if (type === 'all') {
        // If removing all notifications (or all processed)
        if (processedOnly) {
          updated = prev.filter(item => !item.processed);
        } else {
          updated = []; // Remove all
        }
      } else {
        // If removing specific type
        updated = prev.filter(item => {
          // Keep if not this type OR not matching processed state
          return item.type !== type || (processedOnly && !item.processed);
        });
      }
      
      localStorage.setItem('restaurantNotifications', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('restaurantNotifications');
  };
  
  // Get notifications by type (and not processed by default)
  const getNotificationsByType = (type) => {
    if (!type || type === 'all') return notifications;
    return notifications.filter(item => item.type === type);
  };
  
  // Get all processed notifications
  const getProcessedNotifications = () => {
    return notifications.filter(item => item.processed);
  };
  
  // Get today's notifications only
  const getTodayNotifications = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return notifications.filter(notification => {
      const notificationDate = new Date(notification.timestamp).setHours(0, 0, 0, 0);
      return notificationDate >= today;
    });
  };
  
  // Value to provide
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAsProcessed,
    markAllAsRead,
    clearNotifications,
    clearNotificationsByType,
    getNotificationsByType,
    getProcessedNotifications,
    getTodayNotifications,
    removeNotification,
    removeNotificationsByType
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