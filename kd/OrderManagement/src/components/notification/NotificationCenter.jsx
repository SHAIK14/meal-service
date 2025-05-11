import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaEye, FaUtensils, FaCreditCard, FaHistory, FaTimes } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';
import { updateKitchenOrderStatus } from '../../utils/api';

function NotificationCenter({ onTableSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    removeNotification,
    getNotificationsByType 
  } = useNotifications();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get filtered notifications based on active tab
  const filteredNotifications = getNotificationsByType(activeTab);
  
  // Count notifications by type
  const newOrderCount = getNotificationsByType('new_order').length;
  const readyForPickupCount = getNotificationsByType('ready_for_pickup').length;
  const paymentRequestCount = getNotificationsByType('payment_request').length;
  
  // Handle approve order
  const handleApproveOrder = async (orderId, notificationId) => {
    try {
      const response = await updateKitchenOrderStatus(orderId, "admin_approved");
      if (response.success) {
        // Instead of just marking as read, we need to completely remove this notification
        // We'll need to add a removeNotification function to NotificationContext
        removeNotification(notificationId);
        // Or, alternatively, markAsRead and then refresh the list
        // markAsRead(notificationId);
        // Close dropdown after action (optional)
        // setIsOpen(false);
      } else {
        alert("Failed to approve order. Please try again.");
      }
    } catch (error) {
      console.error("Error approving order:", error);
      alert("Error approving order. Please try again.");
    }
  };
  
  // Handle serve order
  const handleServeOrder = async (orderId, notificationId) => {
    try {
      const response = await updateKitchenOrderStatus(orderId, "served");
      if (response.success) {
        markAsRead(notificationId);
        // Close dropdown after action (optional)
        // setIsOpen(false);
      } else {
        alert("Failed to serve order. Please try again.");
      }
    } catch (error) {
      console.error("Error serving order:", error);
      alert("Error serving order. Please try again.");
    }
  };
  
  // Handle view table orders
  const handleViewTable = (tableName, notificationId) => {
    markAsRead(notificationId);
    setIsOpen(false);
    // Call the parent component's callback to select this table
    onTableSelect(tableName);
  };
  
  // Format time elapsed
  const formatTimeElapsed = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    
    // Convert to different time units
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return notificationTime.toLocaleDateString();
  };
  
  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <div className="p-2 bg-blue-100 rounded-full"><FaUtensils className="h-4 w-4 text-blue-600" /></div>;
      case 'ready_for_pickup':
        return <div className="p-2 bg-green-100 rounded-full"><FaCheck className="h-4 w-4 text-green-600" /></div>;
      case 'payment_request':
        return <div className="p-2 bg-purple-100 rounded-full"><FaCreditCard className="h-4 w-4 text-purple-600" /></div>;
      default:
        return <div className="p-2 bg-gray-100 rounded-full"><FaBell className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex gap-3">
              <button 
                className="text-sm text-blue-600 hover:text-blue-800" 
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'new_order' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('new_order')}
            >
              New Orders ({newOrderCount})
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'ready_for_pickup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('ready_for_pickup')}
            >
              Ready ({readyForPickupCount})
            </button>
          </div>
          
          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      {getNotificationIcon(notification.type)}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <span className="text-xs text-gray-500">{formatTimeElapsed(notification.timestamp)}</span>
                        </div>
                        
                        {/* Details based on notification type */}
                        {notification.type === 'new_order' && (
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.items} item{notification.items !== 1 ? 's' : ''}
                          </p>
                        )}
                        
                        {notification.type === 'payment_request' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Amount: {notification.totalAmount?.toFixed(2) || '0.00'} SAR
                          </p>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="mt-2 flex gap-2">
                          {notification.type === 'new_order' && (
                            <>
                              <button 
                                className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveOrder(notification.orderId, notification.id);
                                }}
                              >
                                Approve
                              </button>
                              <button 
                                className="px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTable(notification.tableName, notification.id);
                                }}
                              >
                                View
                              </button>
                            </>
                          )}
                          
                          {notification.type === 'ready_for_pickup' && (
                            <>
                              <button 
                                className="px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServeOrder(notification.orderId, notification.id);
                                }}
                              >
                                Serve
                              </button>
                              <button 
                                className="px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTable(notification.tableName, notification.id);
                                }}
                              >
                                View
                              </button>
                            </>
                          )}
                          
                          {notification.type === 'payment_request' && (
                            <button 
                              className="px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTable(notification.tableName, notification.id);
                              }}
                            >
                              Process Payment
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center text-gray-500">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FaBell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No notifications</p>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'all' 
                    ? 'You have no notifications at the moment' 
                    : `You have no ${activeTab.replace('_', ' ')} notifications`}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center w-full gap-1" 
                onClick={() => {
                  // Here you could navigate to a full history page
                  // For now, we'll just toggle between all notifications and a "history" view
                  setActiveTab('all');
                }}
              >
                <FaHistory className="h-3 w-3" /> View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;