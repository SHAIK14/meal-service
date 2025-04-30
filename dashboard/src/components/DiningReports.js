import React, { useState, useEffect } from "react";
import {
  getAllBranches,
  getDiningReportSummary,
  getDiningReportOrders,
  getDiningReportDetails,
} from "../utils/api2";
import {
  FaCalendarAlt,
  FaSearch,
  FaFileDownload,
  FaFilter,
  FaEye,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DiningReports = () => {
  // State variables
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    paymentMethod: "all",
    status: "all",
    page: 1,
    limit: 10,
  });

  // Initial data loading
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch data when branch or dates change
  useEffect(() => {
    if (selectedBranch) {
      fetchSummaryData();
      fetchOrdersData();
    }
  }, [selectedBranch, startDate, endDate, filters.page]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await getAllBranches();
      if (response.success) {
        setBranches(response.data);
        // Auto-select first branch if available
        if (response.data.length > 0) {
          setSelectedBranch(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const response = await getDiningReportSummary(
        selectedBranch,
        formattedStartDate,
        formattedEndDate
      );

      console.log("Summary API response:", response);

      if (response.success) {
        // Handle potential nested data structure
        const summaryData = response.data.data || response.data;
        setSummary(summaryData);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const response = await getDiningReportOrders(selectedBranch, {
        ...filters,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      console.log("Orders API response:", response);

      if (response.success) {
        // Fix for double-nested data structure
        const responseData = response.data.data || response.data;

        // Make sure these properties exist before setting state
        const orderData = responseData.orders || [];
        const paginationData = responseData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        };

        setOrders(orderData);
        setPagination(paginationData);
      } else {
        // Handle error case
        console.error("Error in API response:", response.error);
        setOrders([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (error) {
      console.error("Error fetching orders data:", error);
      setOrders([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const response = await getDiningReportDetails(orderId);
      console.log("Order details response:", response);

      if (response.success) {
        const orderDetails = response.data.data || response.data;
        setSelectedOrder(orderDetails);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrdersData();
  };

  const exportToCSV = () => {
    // Add a null check here
    if (!orders || orders.length === 0) return;

    // First, we need to get detailed information for each order
    const fetchAllOrderDetails = async () => {
      setLoading(true);
      try {
        // Create an array of promises for all order detail requests
        const detailPromises = orders.map((order) =>
          getDiningReportDetails(order.orderId)
        );

        // Execute all promises in parallel
        const detailsResponses = await Promise.all(detailPromises);

        // Extract the data from responses
        const orderDetails = detailsResponses
          .map((response) => {
            if (response.success) {
              return response.data.data || response.data;
            }
            return null;
          })
          .filter((detail) => detail !== null);

        generateCSVFromDetails(orderDetails);
      } catch (error) {
        console.error("Error fetching order details for export:", error);
        alert("Failed to export complete data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const generateCSVFromDetails = (orderDetails) => {
      // Define all the columns for the CSV
      const headers = [
        "Date",
        "Order ID",
        "Branch",
        "Table",
        "Customer",
        "Customer Phone",
        "Order Status",
        "Total Amount (SAR)",
        "Number of Items",
        "Items Details",
        "Payment Method",
        "Cash Amount",
        "Card Amount",
        "Tips Amount",
        "Order Created",
        "Admin Approved",
        "In Preparation",
        "Ready for Pickup",
        "Served",
        "Cancelled",
        "Payment Completed",
      ];

      // Generate rows for each order
      const rows = orderDetails.map((order) => {
        // Calculate payment breakdowns
        let cashAmount = 0;
        let cardAmount = 0;
        let tipsAmount = 0;

        if (order.session && order.session.payments) {
          order.session.payments.forEach((payment) => {
            if (payment.method === "cash") {
              cashAmount += payment.amount || 0;
            } else if (payment.method === "card") {
              cardAmount += payment.amount || 0;
            }
          });
        }

        if (order.session && order.session.excessAllocation) {
          const tipAllocations = order.session.excessAllocation.filter(
            (a) => a.type === "tip"
          );
          tipAllocations.forEach((tip) => {
            tipsAmount += tip.amount || 0;
          });
        }

        // Format items details
        const itemsDetails = order.items
          ? order.items
              .map(
                (item) =>
                  `${item.name} (${item.effectiveQuantity} x ${formatCurrency(
                    item.price
                  )})${
                    item.returnedQuantity > 0
                      ? ` [${item.returnedQuantity} returned]`
                      : ""
                  }${
                    item.cancelledQuantity > 0
                      ? ` [${item.cancelledQuantity} cancelled]`
                      : ""
                  }`
              )
              .join("; ")
          : "";

        // Create the row
        return [
          new Date(order.date).toLocaleDateString(),
          order.orderNumber || "",
          order.branchName || "",
          order.tableName || "",
          order.session?.customerName || "",
          order.session?.customerPhone || "",
          order.status || "",
          order.orderTotal || 0,
          order.items?.length || 0,
          itemsDetails,
          order.session?.paymentMethod || "",
          cashAmount,
          cardAmount,
          tipsAmount,
          formatDate(order.statusTimestamps?.pending || ""),
          formatDate(order.statusTimestamps?.admin_approved || ""),
          formatDate(order.statusTimestamps?.in_preparation || ""),
          formatDate(order.statusTimestamps?.ready_for_pickup || ""),
          formatDate(order.statusTimestamps?.served || ""),
          formatDate(order.statusTimestamps?.canceled || ""),
          formatDate(order.session?.paymentTimestamp || ""),
        ];
      });

      // Create the CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Ensure cells with commas are wrapped in quotes
              const cellStr = String(cell).replace(/"/g, '""');
              return cellStr.includes(",") ? `"${cellStr}"` : cellStr;
            })
            .join(",")
        ),
      ].join("\n");

      // Download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `dining-report-detailed-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Start the export process
    fetchAllOrderDetails();
  };

  const formatCurrency = (amount) => {
    // Add null/undefined check to prevent NaN
    if (amount === undefined || amount === null) return "0.00";

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-2xl font-semibold mb-6">Dining Reports</h1>

      {/* Branch & Date Selection */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">Select a branch</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              dateFormat="yyyy-MM-dd"
              disabled={loading}
            />
            <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              dateFormat="yyyy-MM-dd"
              disabled={loading}
            />
            <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              fetchSummaryData();
              fetchOrdersData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading || !selectedBranch}
          >
            {loading ? "Loading..." : "Apply Filters"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalRevenue || 0)} SAR
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold">{summary.totalOrders || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Total Sessions</h3>
            <p className="text-2xl font-bold">{summary.totalSessions || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Order ID, Customer, Table..."
                className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                handleFilterChange("paymentMethod", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="admin_approved">Approved</option>
              <option value="in_preparation">In Preparation</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="served">Served</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaFilter /> Filter
            </button>

            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              disabled={orders.length === 0}
            >
              <FaFileDownload /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : !orders || orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    No orders found for the selected criteria
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr
                    key={order.orderId || `order-${i}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date
                        ? new Date(order.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.tableName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(order.totalAmount || 0)} SAR
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            order.sessionData &&
                            order.sessionData.paymentMethod === "cash"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            order.sessionData &&
                            order.sessionData.paymentMethod === "card"
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                          ${
                            order.sessionData &&
                            order.sessionData.paymentMethod === "mixed"
                              ? "bg-purple-100 text-purple-800"
                              : ""
                          }
                        `}
                      >
                        {order.sessionData && order.sessionData.paymentMethod
                          ? order.sessionData.paymentMethod
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                          ${
                            order.status === "admin_approved"
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                          ${
                            order.status === "in_preparation"
                              ? "bg-indigo-100 text-indigo-800"
                              : ""
                          }
                          ${
                            order.status === "ready_for_pickup"
                              ? "bg-purple-100 text-purple-800"
                              : ""
                          }
                          ${
                            order.status === "served"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            order.status === "canceled"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }
                        `}
                      >
                        {order.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(order.orderId)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  handleFilterChange("page", Math.max(1, filters.page - 1))
                }
                disabled={filters.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  handleFilterChange(
                    "page",
                    Math.min(pagination.totalPages, filters.page + 1)
                  )
                }
                disabled={filters.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(filters.page - 1) * filters.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      filters.page * filters.limit,
                      pagination.totalItems
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalItems}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handleFilterChange("page", 1)}
                    disabled={filters.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handleFilterChange("page", filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {/* Page buttons */}
                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, i) => {
                      const pageNum = i + 1;
                      const isCurrentPage = pageNum === filters.page;
                      return (
                        <button
                          key={i}
                          onClick={() => handleFilterChange("page", pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            isCurrentPage
                              ? "bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          } text-sm font-medium`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handleFilterChange("page", filters.page + 1)}
                    disabled={filters.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() =>
                      handleFilterChange("page", pagination.totalPages)
                    }
                    disabled={filters.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Last
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">
                Order Details - {selectedOrder.orderNumber || "N/A"}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* General Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Branch</p>
                  <p className="font-medium">
                    {selectedOrder.branchName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Table</p>
                  <p className="font-medium">
                    {selectedOrder.tableName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedOrder.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-medium">
                    {selectedOrder.session?.customerName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium">
                    {selectedOrder.session?.customerPhone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-medium">{selectedOrder.status || "N/A"}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium mb-3">Order Items</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Item
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items &&
                        selectedOrder.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>
                                <p className="font-medium">
                                  {item.name || "N/A"}
                                </p>
                                {(item.returnedQuantity > 0 ||
                                  item.cancelledQuantity > 0) && (
                                  <div className="text-xs text-red-600 mt-1">
                                    {item.cancelledQuantity > 0 && (
                                      <p>
                                        Cancelled: {item.cancelledQuantity} (
                                        {item.cancelReason || "No reason"})
                                      </p>
                                    )}
                                    {item.returnedQuantity > 0 && (
                                      <p>
                                        Returned: {item.returnedQuantity} (
                                        {item.returnReason || "No reason"})
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 text-center">
                              {item.effectiveQuantity || 0}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 text-right">
                              {formatCurrency(item.price || 0)}{" "}
                              {selectedOrder.currency || "SAR"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">
                              {formatCurrency(item.effectivePrice || 0)}{" "}
                              {selectedOrder.currency || "SAR"}
                            </td>
                          </tr>
                        ))}
                      {(!selectedOrder.items ||
                        selectedOrder.items.length === 0) && (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No items found for this order
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-3 text-right text-sm font-medium"
                        >
                          Order Total
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-bold">
                          {formatCurrency(selectedOrder.orderTotal || 0)}{" "}
                          {selectedOrder.currency || "SAR"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Details */}
              {selectedOrder.session && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Payment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Methods */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="font-medium">Payment Methods</h4>
                      </div>
                      <div className="p-4">
                        {selectedOrder.session.payments &&
                        selectedOrder.session.payments.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">
                                  Method
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">
                                  Amount
                                </th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500">
                                  Receipt #
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedOrder.session.payments.map(
                                (payment, idx) => (
                                  <tr key={idx}>
                                    <td className="px-2 py-3 text-sm">
                                      <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                     ${
                                       payment.method === "cash"
                                         ? "bg-green-100 text-green-800"
                                         : ""
                                     }
                                     ${
                                       payment.method === "card"
                                         ? "bg-blue-100 text-blue-800"
                                         : ""
                                     }
                                   `}
                                      >
                                        {payment.method &&
                                          payment.method
                                            .charAt(0)
                                            .toUpperCase() +
                                            payment.method.slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-2 py-3 text-sm text-right font-medium">
                                      {formatCurrency(payment.amount || 0)}{" "}
                                      {selectedOrder.currency || "SAR"}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-center">
                                      {payment.receiptNumber || "-"}
                                    </td>
                                  </tr>
                                )
                              )}
                              <tr className="bg-gray-50">
                                <td className="px-2 py-3 text-sm font-medium">
                                  Total Paid
                                </td>
                                <td className="px-2 py-3 text-sm text-right font-bold">
                                  {formatCurrency(
                                    selectedOrder.session.payments?.reduce(
                                      (sum, p) => sum + (p.amount || 0),
                                      0
                                    ) || 0
                                  )}{" "}
                                  {selectedOrder.currency || "SAR"}
                                </td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No payment details available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Excess Allocation */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="font-medium">Excess Allocation</h4>
                      </div>
                      <div className="p-4">
                        {selectedOrder.session.excessAllocation &&
                        selectedOrder.session.excessAllocation.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">
                                  Type
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">
                                  Amount
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">
                                  Remark
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedOrder.session.excessAllocation.map(
                                (allocation, idx) => (
                                  <tr key={idx}>
                                    <td className="px-2 py-3 text-sm">
                                      <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                     ${
                                       allocation.type === "tip"
                                         ? "bg-green-100 text-green-800"
                                         : ""
                                     }
                                     ${
                                       allocation.type === "change"
                                         ? "bg-blue-100 text-blue-800"
                                         : ""
                                     }
                                     ${
                                       allocation.type === "advance"
                                         ? "bg-purple-100 text-purple-800"
                                         : ""
                                     }
                                     ${
                                       allocation.type === "custom"
                                         ? "bg-gray-100 text-gray-800"
                                         : ""
                                     }
                                   `}
                                      >
                                        {allocation.type &&
                                          allocation.type
                                            .charAt(0)
                                            .toUpperCase() +
                                            allocation.type.slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-2 py-3 text-sm text-right font-medium">
                                      {formatCurrency(allocation.amount || 0)}{" "}
                                      {selectedOrder.currency || "SAR"}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-gray-500">
                                      {allocation.remark || "-"}
                                    </td>
                                  </tr>
                                )
                              )}
                              <tr className="bg-gray-50">
                                <td className="px-2 py-3 text-sm font-medium">
                                  Total Allocated
                                </td>
                                <td className="px-2 py-3 text-sm text-right font-bold">
                                  {formatCurrency(
                                    selectedOrder.session.excessAllocation?.reduce(
                                      (sum, a) => sum + (a.amount || 0),
                                      0
                                    ) || 0
                                  )}{" "}
                                  {selectedOrder.currency || "SAR"}
                                </td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No excess allocation
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Timeline */}
              <div>
                <h3 className="text-lg font-medium mb-3">Order Timeline</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedOrder.statusTimestamps?.pending && (
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          New Order:{" "}
                          {formatDate(selectedOrder.statusTimestamps.pending)}
                        </span>
                      </div>
                    )}

                    {selectedOrder.statusTimestamps?.admin_approved && (
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Approved:{" "}
                          {formatDate(
                            selectedOrder.statusTimestamps.admin_approved
                          )}
                        </span>
                      </div>
                    )}

                    {selectedOrder.statusTimestamps?.in_preparation && (
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          Preparing:{" "}
                          {formatDate(
                            selectedOrder.statusTimestamps.in_preparation
                          )}
                        </span>
                      </div>
                    )}

                    {selectedOrder.statusTimestamps?.ready_for_pickup && (
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Ready:{" "}
                          {formatDate(
                            selectedOrder.statusTimestamps.ready_for_pickup
                          )}
                        </span>
                      </div>
                    )}

                    {selectedOrder.statusTimestamps?.served && (
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Served:{" "}
                          {formatDate(selectedOrder.statusTimestamps.served)}
                        </span>
                      </div>
                    )}

                    {selectedOrder.statusTimestamps?.canceled && (
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Canceled:{" "}
                          {formatDate(selectedOrder.statusTimestamps.canceled)}
                        </span>
                      </div>
                    )}

                    {selectedOrder.session?.paymentTimestamp && (
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Payment:{" "}
                          {formatDate(selectedOrder.session.paymentTimestamp)}
                        </span>
                      </div>
                    )}

                    {!selectedOrder.statusTimestamps &&
                      !selectedOrder.session?.paymentTimestamp && (
                        <div className="text-sm text-gray-500">
                          No timeline information available
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiningReports;
