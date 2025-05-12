import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaEye, FaUtensils, FaCreditCard, FaHistory, FaTimes, FaTrash } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';
import { updateKitchenOrderStatus } from '../../utils/api';

function NotificationCenter({ onTableSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('new_order'); // Default to new orders
  const [historySubTab, setHistorySubTab] = useState('all'); // Default to all history
  const dropdownRef = useRef(null);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAsProcessed,
    markAllAsRead,
    removeNotification,
    clearNotificationsByType,
    getNotificationsByType,
    removeNotificationsByType
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
  
  // Get filtered notifications based on active tab and history sub-tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      // Get processed notifications for history
      const processed = notifications.filter(n => n.processed);
      
      // Filter history by sub-tab
      if (historySubTab === 'new_order') {
        return processed.filter(n => n.type === 'new_order');
      } else if (historySubTab === 'ready_for_pickup') {
        return processed.filter(n => n.type === 'ready_for_pickup');
      } else if (historySubTab === 'payment_request') {
        return processed.filter(n => n.type === 'payment_request');
      } else {
        return processed; // All history
      }
    } else {
      // For other tabs, get unprocessed notifications by type
      return notifications.filter(n => n.type === activeTab && !n.processed);
    }
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  // Count notifications by type (only unprocessed)
  const newOrderCount = notifications.filter(n => n.type === 'new_order' && !n.processed).length;
  const readyForPickupCount = notifications.filter(n => n.type === 'ready_for_pickup' && !n.processed).length;
  const paymentRequestCount = notifications.filter(n => n.type === 'payment_request' && !n.processed).length;
  
  // Get history counts for sub-tabs
  const historyAllCount = notifications.filter(n => n.processed).length;
  const historyOrderCount = notifications.filter(n => n.type === 'new_order' && n.processed).length;
  const historyReadyCount = notifications.filter(n => n.type === 'ready_for_pickup' && n.processed).length;
  const historyPaymentCount = notifications.filter(n => n.type === 'payment_request' && n.processed).length;
  
  // Handle approve order
  const handleApproveOrder = async (orderId, notificationId) => {
    try {
      const response = await updateKitchenOrderStatus(orderId, "admin_approved");
      if (response.success) {
        // Mark as read AND processed
        markAsRead(notificationId);
        markAsProcessed(notificationId);
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
        markAsProcessed(notificationId);
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
  
  // Handle clear button click
  const handleClear = () => {
    if (activeTab === 'all') {
      if (historySubTab === 'all') {
        // Clear all processed notifications
        removeNotificationsByType('all', true);
      } else {
        // Clear specific type of processed notifications
        removeNotificationsByType(historySubTab, true);
      }
    } else {
      // Remove unprocessed notifications of active tab type
      removeNotificationsByType(activeTab, false);
    }
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
  
  // Get icon for notification type - Fixed styling for consistent width/height
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <FaUtensils className="h-4 w-4 text-blue-600" />
        </div>;
      case 'ready_for_pickup':
        return <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
          <FaCheck className="h-4 w-4 text-green-600" />
        </div>;
      case 'payment_request':
        return <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
          <FaCreditCard className="h-4 w-4 text-purple-600" />
        </div>;
      default:
        return <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
          <FaBell className="h-4 w-4 text-gray-600" />
        </div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button 
        className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 flex flex-col items-center">
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            {/* Tooltip for breakdown - shows on hover */}
            <div className="notification-tooltip hidden group-hover:block absolute top-6 right-0 bg-white shadow-md rounded p-2 text-xs z-50 w-28">
              {newOrderCount > 0 && <div className="flex justify-between"><span>New Orders:</span> <span>{newOrderCount}</span></div>}
              {readyForPickupCount > 0 && <div className="flex justify-between"><span>Ready:</span> <span>{readyForPickupCount}</span></div>}
              {paymentRequestCount > 0 && <div className="flex justify-between"><span>Payments:</span> <span>{paymentRequestCount}</span></div>}
            </div>
          </div>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex gap-3">
              {filteredNotifications.length > 0 && (
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800" 
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs - Reordered with Payment Requests */}
          <div className="flex border-b border-gray-200">
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
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'payment_request' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('payment_request')}
            >
              Payments ({paymentRequestCount})
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('all')}
            >
              All ({historyAllCount})
            </button>
          </div>
          
          {/* History Sub-tabs - Only shown when All tab is active */}
          {activeTab === 'all' && (
            <div className="flex bg-gray-50 border-b border-gray-200 text-xs">
              <button 
                className={`flex-1 py-1 px-2 font-medium ${historySubTab === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setHistorySubTab('all')}
              >
                All ({historyAllCount})
              </button>
              <button 
                className={`flex-1 py-1 px-2 font-medium ${historySubTab === 'new_order' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setHistorySubTab('new_order')}
              >
                Orders ({historyOrderCount})
              </button>
              <button 
                className={`flex-1 py-1 px-2 font-medium ${historySubTab === 'ready_for_pickup' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setHistorySubTab('ready_for_pickup')}
              >
                Ready ({historyReadyCount})
              </button>
              <button 
                className={`flex-1 py-1 px-2 font-medium ${historySubTab === 'payment_request' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setHistorySubTab('payment_request')}
              >
                Payments ({historyPaymentCount})
              </button>
            </div>
          )}
          
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
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                            {notification.orderId && ` - Order #${notification.orderId.slice(-4)}`}
                          </h4>
                          <span className="text-xs text-gray-500">{formatTimeElapsed(notification.timestamp)}</span>
                        </div>
                        
                        {/* Item Details */}
                        {notification.type === 'new_order' && notification.itemsSummary && (
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.itemsSummary}
                          </p>
                        )}
                        
                        {/* Payment Details */}
                        {notification.type === 'payment_request' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Amount: {notification.totalAmount?.toFixed(2) || '0.00'} SAR
                          </p>
                        )}
                        
                        {/* Action Buttons - Only shown for unprocessed notifications */}
                        {!notification.processed && (
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
                        )}
                        
                        {/* View button for history items */}
                        {notification.processed && (
                          <div className="mt-2 flex justify-end">
                            <button 
                              className="px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTable(notification.tableName, notification.id);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        )}
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
                    ? `You have no ${historySubTab === 'all' ? 'history' : historySubTab.replace('_', ' ')} notifications` 
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
                  setActiveTab('all');
                  setHistorySubTab('all');
                }}
              >
                <FaHistory className="h-3 w-3" /> View all history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;