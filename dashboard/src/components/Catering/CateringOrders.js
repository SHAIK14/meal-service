import React, { useState } from "react";
import { X, Check, ExternalLink, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "./OrderModal";
import CateringOrderDetails from "./CateringOrderDetails";
import LeadAssign from "./LeadAssign";

const CateringOrders = () => {
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showMissingItemModal, setShowMissingItemModal] = useState(false);
  const [missingItemsNote, setMissingItemsNote] = useState("");

  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const submitPartialComplete = (orderId, note) => {
    // Find the order that needs to be moved to completed
    const orderToComplete = acceptedOrders.find(
      (order) => order.id === orderId
    );

    if (orderToComplete) {
      // Create a new completed order object with the partial flag and note
      const completedOrder = {
        ...orderToComplete,
        completedDate: new Date().toLocaleDateString(),
        isPartial: true,
        missingNote: note,
        status: "partial", // Optional - if you need an explicit status field
      };

      // Add to completed orders
      setCompletedOrders((prev) => [...prev, completedOrder]);

      // Remove from accepted orders
      setAcceptedOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  const handlePartialComplete = (orderId) => {
    // Open a modal to ask for missing item reason
    setCurrentOrderId(orderId);
    setShowMissingItemModal(true);
  };

  // Sample data - replace with your actual data fetching logic
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 1,
      customerName: "Mohammed",
      phoneNumber: "+966 54 321 1234",
      orderDate: "2025-04-04",
      paymentMode: "Credit Card",
      paymentStatus: "100%",
    },
    {
      id: 2,
      customerName: "Abdullah",
      phoneNumber: "+966 12 254 1235",
      orderDate: "2025-04-05",
      paymentMode: "Bank Transfer",
      paymentStatus: "75%",
    },
    {
      id: 3,
      customerName: "Rehman",
      phoneNumber: "+966 52 125 4759",
      orderDate: "2025-04-06",
      paymentMode: "Cash",
      paymentStatus: "75%",
    },
  ]);

  const [acceptedOrders, setAcceptedOrders] = useState([
    {
      id: 4,
      customerName: "Ahmed ",
      phoneNumber: "+966 54 321 1234",
      orderDate: "2025-04-02",
      acceptedDate: "2025-04-02",
    },
    {
      id: 5,
      customerName: "ibrahim",
      phoneNumber: "+966 12 547 8654",
      orderDate: "2025-04-03",
      acceptedDate: "2025-04-03",
    },
  ]);

  const [completedOrders, setCompletedOrders] = useState([
    {
      id: 6,
      customerName: "Abdul",
      phoneNumber: "+966 54 221 1234",
      orderDate: "2025-03-28",
      completedDate: "2025-04-01",
    },
    {
      id: 7,
      customerName: "Moiz",
      phoneNumber: "+966 12 548 9875",
      orderDate: "2025-03-29",
      completedDate: "2025-04-02",
    },
  ]);

  // New state for rejected orders
  const [rejectedOrders, setRejectedOrders] = useState([
    {
      id: 8,
      customerName: "Farhan",
      phoneNumber: "+966 54 123 4567",
      orderDate: "2025-03-30",
      rejectedDate: "2025-03-31",
      rejectedTime: "14:30",
      rejectionReason: "Customer requested cancellation",
    },
    {
      id: 9,
      customerName: "Zain",
      phoneNumber: "+966 12 987 6543",
      orderDate: "2025-04-01",
      rejectedDate: "2025-04-01",
      rejectedTime: "10:15",
      rejectionReason: "Ingredients not available for requested menu",
    },
  ]);

  const [activeTab, setActiveTab] = useState("pending");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const handleAccept = (id) => {
    // Find the order to accept
    const orderToAccept = pendingOrders.find((order) => order.id === id);
    if (orderToAccept) {
      // Add to accepted orders with acceptance date
      setAcceptedOrders([
        ...acceptedOrders,
        {
          ...orderToAccept,
          acceptedDate: new Date().toISOString().split("T")[0],
        },
      ]);
      // Remove from pending orders
      setPendingOrders(pendingOrders.filter((order) => order.id !== id));
    }
  };

  const handleRejectClick = (id) => {
    setCurrentOrderId(id);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    // Find the order to reject
    const orderToReject = pendingOrders.find(
      (order) => order.id === currentOrderId
    );

    if (orderToReject) {
      // Get current date and time
      const now = new Date();
      const rejectedDate = now.toISOString().split("T")[0];
      const rejectedTime = now.toTimeString().split(" ")[0].substring(0, 5); // Format: HH:MM

      // Add to rejected orders with rejection details
      setRejectedOrders([
        ...rejectedOrders,
        {
          ...orderToReject,
          rejectedDate,
          rejectedTime,
          rejectionReason: rejectionReason.trim(),
        },
      ]);

      // Remove from pending orders
      setPendingOrders(
        pendingOrders.filter((order) => order.id !== currentOrderId)
      );
    }

    // Reset modal state
    setShowRejectModal(false);
    setRejectionReason("");
    setCurrentOrderId(null);
  };

  const handleComplete = (orderId) => {
    const orderToComplete = acceptedOrders.find(
      (order) => order.id === orderId
    );

    if (orderToComplete) {
      const completedOrder = {
        ...orderToComplete,
        completedDate: new Date().toLocaleDateString(),
        isPartial: false,
      };

      setCompletedOrders((prev) => [...prev, completedOrder]);
      setAcceptedOrders((prev) => prev.filter((order) => order.id !== orderId));

      // API call if needed

      // You can use alert or implement your own notification system
      // alert("Order marked as complete");
      // Or simply remove this if you have no notification system
    }
  };

  return (
    <div className=" px-4 py-6 bg-white h-screen overflow-y-scroll w-full">
      <div className="p-6 bg-gray-100 h-screen ">
        <h1 className="text-2xl font-bold mb-6 text-left">Catering Orders</h1>
        {/* Tabs - Added rejected tab */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 ${
              activeTab === "pending"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Order Requests ({pendingOrders.length})
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "accepted"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("accepted")}
          >
            Accepted Orders ({acceptedOrders.length})
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "completed"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed Orders ({completedOrders.length})
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "rejected"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected Orders ({rejectedOrders.length})
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === "pending" && (
            <div>
              <h2 className="text-lg font-semibold p-4 bg-gray-50">
                Order Requests
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.orderDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.paymentMode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.paymentStatus}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            onClick={() => handleViewDetails(order)}
                            className="text-blue-500 cursor-pointer hover:text-blue-700 flex items-center"
                          >
                            View Details{" "}
                            <ExternalLink className="ml-1" size={16} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAccept(order.id)}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center hover:bg-green-200"
                            >
                              <Check size={16} className="mr-1" /> Accept
                            </button>
                            <button
                              onClick={() => handleRejectClick(order.id)}
                              className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center hover:bg-red-200"
                            >
                              <X size={16} className="mr-1" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No pending orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "accepted" && (
            <div>
              <h2 className="text-lg font-semibold p-4 bg-gray-50">
                Accepted Orders
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accepted Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assign Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {acceptedOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.orderDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.acceptedDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            onClick={() => handleViewDetails(order)}
                            className="text-blue-500 cursor-pointer hover:text-blue-700 flex items-center"
                          >
                            View Details{" "}
                            <ExternalLink className="ml-1" size={16} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={openModal}
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center hover:bg-purple-200"
                          >
                            Assign Lead
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleComplete(order.id)}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center hover:bg-blue-200"
                            >
                              <Check size={16} className="mr-1" /> Mark Complete
                            </button>
                            <button
                              onClick={() => handlePartialComplete(order.id)}
                              className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center hover:bg-amber-200"
                            >
                              <AlertCircle size={16} className="mr-1" /> Partial
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {showMissingItemModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                          <h3 className="text-lg font-medium mb-4">
                            What items are missing?
                          </h3>
                          <textarea
                            className="w-full border border-gray-300 rounded p-2 mb-4"
                            rows="4"
                            placeholder="Please describe the missing items..."
                            value={missingItemsNote}
                            onChange={(e) =>
                              setMissingItemsNote(e.target.value)
                            }
                          />
                          <div className="flex justify-end space-x-3">
                            <button
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setShowMissingItemModal(false);
                                setMissingItemsNote("");
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                              onClick={() => {
                                submitPartialComplete(
                                  currentOrderId,
                                  missingItemsNote
                                );
                                setShowMissingItemModal(false);
                                setMissingItemsNote("");
                              }}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {acceptedOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No accepted orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "completed" && (
            <div>
              <h2 className="text-lg font-semibold p-4 bg-gray-50">
                Completed Orders
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.orderDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.completedDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.isPartial ? (
                            <div className="flex items-center">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                Partial
                              </span>
                              {order.missingNote && (
                                <div className="ml-2 relative group">
                                  <AlertCircle
                                    size={16}
                                    className="text-amber-500 cursor-help"
                                  />
                                  <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 rounded p-2 shadow-lg bottom-6 -left-24 w-64">
                                    <p className="text-xs text-gray-600">
                                      {order.missingNote}
                                    </p>
                                    <div className="absolute h-2 w-2 bg-white rotate-45 border-b border-r border-gray-200 -bottom-1 left-24"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Complete
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            onClick={() => handleViewDetails(order)}
                            className="text-blue-500 cursor-pointer hover:text-blue-700 flex items-center"
                          >
                            View Details{" "}
                            <ExternalLink className="ml-1" size={16} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            onClick={() => navigate("/checklist")}
                            className="text-blue-500 cursor-pointer hover:text-blue-700 flex items-center"
                          >
                            Item Check List{" "}
                            <ExternalLink className="ml-1" size={16} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {completedOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No completed orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* New Rejected Orders Tab */}
          {activeTab === "rejected" && (
            <div>
              <h2 className="text-lg font-semibold p-4 bg-gray-50">
                Rejected Orders
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rejectedOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.orderDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.rejectedDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.rejectedTime}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs">
                            {order.rejectionReason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            onClick={() => handleViewDetails(order)}
                            className="text-blue-500 cursor-pointer hover:text-blue-700 flex items-center"
                          >
                            View Details{" "}
                            <ExternalLink className="ml-1" size={16} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rejectedOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No rejected orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Reject Order</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this order..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Order Details"
      >
        {selectedOrder && <CateringOrderDetails order={selectedOrder} />}
      </Modal>

      {/* Assign Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[60vw] h-[80vh] overflow-y-scroll p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>

            {/* LeadAssign component inside modal */}
            <LeadAssign />
          </div>
        </div>
      )}
    </div>
  );
};

export default CateringOrders;
