import React, { useState, useEffect, useCallback } from "react";
import {
  getAllSubscriptions,
  getSubscriptionAnalytics,
  updateSubscriptionStatus,
} from "../utils/api.js";
import { Calendar, Search, Filter } from "lucide-react";

// import "../styles/Subscriptions.css";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState({
    active: { count: 0, totalRevenue: 0 },
    paused: { count: 0, totalRevenue: 0 },
    cancelled: { count: 0, totalRevenue: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    search: "",
    planType: "",
    package: "",
    page: 1,
    limit: 10,
  });
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllSubscriptions(filters);

      if (response.success && response.data) {
        const {
          subscriptions: fetchedSubscriptions,
          pagination,
          stats,
        } = response.data;

        if (Array.isArray(fetchedSubscriptions)) {
          setSubscriptions(fetchedSubscriptions);
          setTotalRecords(pagination?.total || fetchedSubscriptions.length);
        } else {
          setSubscriptions([]);
          setTotalRecords(0);
        }

        if (stats) {
          const formattedStats = {};
          Object.entries(stats).forEach(([status, data]) => {
            formattedStats[status] = {
              count: data.count || 0,
              totalRevenue: data.revenue || 0,
            };
          });
          setAnalytics((prev) => ({
            ...prev,
            ...formattedStats,
          }));
        }
      } else {
        setSubscriptions([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error in fetchSubscriptions:", error);
      setSubscriptions([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await getSubscriptionAnalytics({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      if (response.success && response.data) {
        const analyticsData = Array.isArray(response.data)
          ? response.data[0]
          : {};

        const formattedAnalytics = {
          active: {
            count: analyticsData?.totalCount || 0,
            totalRevenue: analyticsData?.totalRevenue || 0,
            planTypes: analyticsData?.planTypes || [],
          },
        };

        setAnalytics((prev) => ({
          ...prev,
          ...formattedAnalytics,
        }));
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchSubscriptions();
    fetchAnalytics();
  }, [fetchSubscriptions, fetchAnalytics]);

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      const response = await updateSubscriptionStatus(subscriptionId, {
        status: newStatus,
      });
      if (response.success) {
        await Promise.all([fetchSubscriptions(), fetchAnalytics()]);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "page" ? value : 1,
    }));
  };

  const renderAnalytics = () => {
    return Object.entries(analytics).map(([status, data]) => {
      // Debugging: Log the status to verify it's being passed correctly
      console.log("Status:", status);

      return (
        <div className="py-4 flex flex-1  ">
          <div
            key={status}
            className={`p-4  flex flex-col flex-1   rounded-lg shadow-md text-white 
            ${
              status === "active"
                ? "bg-green-600"
                : status === "paused"
                ? "bg-yellow-500"
                : status === "cancelled"
                ? "bg-red-600"
                : "bg-gray-500"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{status}</h3>
            </div>
            <div>
              <div className="mb-2">
                <span className="text-3xl font-bold">{data?.count || 0}</span>
                <span className="text-sm ml-2">subscriptions</span>
              </div>
              <div className="text-xl font-medium">
                SAR {(data?.totalRevenue || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const getDurationDisplay = (plan) => {
    if (!plan) return "N/A";

    let duration = "";
    if (plan.selectedDuration) {
      if (plan.selectedDuration.includes("week")) {
        duration = `${plan.selectedDuration} (${plan.duration} days/week)`;
      } else if (plan.selectedDuration.includes("month")) {
        duration = `${plan.selectedDuration} (${plan.duration} days/week)`;
      } else {
        duration = `${plan.selectedDuration}, ${plan.duration} days/week`;
      }
    } else {
      duration = `${plan.duration} days/week`;
    }
    return duration;
  };

  const renderSubscriptionRow = (subscription) => {
    if (!subscription) return null;

    return (
      <tr key={subscription._id} className="">
        <td className="">
          <div className="font-semibold">{subscription.orderId}</div>
          <div className="user-email">{subscription.user?.email || "N/A"}</div>
        </td>
        <td>
          <div className="plan-details">
            <div className="font-semibold">
              {subscription.plan?.planId?.nameEnglish ||
                subscription.plan?.name ||
                "N/A"}
            </div>
            <div className="">
              <span className="tex-gray-600">
                {subscription.plan?.selectedPackages?.join(", ") || "N/A"}
              </span>
            </div>
            <div className="text-[8pt] bg-gray-100 w-fit p-1 rounded-md">
              {getDurationDisplay(subscription.plan)}
            </div>
          </div>
        </td>
        <td className="">
          <div className="status-container  ">
            <span
              className={`  status ${
                subscription.status === "active"
                  ? "text-green-500"
                  : subscription.status === "cancelled"
                  ? "text-red-500"
                  : subscription.status === "paused"
                  ? "text-yellow-500"
                  : ""
              }`}
            >
              {subscription.status}
            </span>
          </div>
        </td>
        <td>
          <div className="">
            <div className="">
              <div className="font-semibold">
                SAR {(subscription.pricing?.finalAmount || 0).toLocaleString()}
              </div>
              {subscription.pricing?.originalAmount >
                subscription.pricing?.finalAmount && (
                <div className="">
                  <span className="">
                    SAR {subscription.pricing.originalAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            {subscription.pricing?.voucherDiscount > 0 && (
              <div className="">
                <div className="text-red-500">
                  -{subscription.pricing.voucherDiscount.toLocaleString()} SAR
                </div>
                {subscription.voucher && (
                  <div className="voucher-details">
                    <span className="voucher-code">
                      {subscription.voucher.code}
                    </span>
                    {subscription.voucher.description && (
                      <span className="voucher-description">
                        {subscription.voucher.description}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
        <td>
          <select
            value={subscription.status}
            onChange={(e) =>
              handleStatusChange(subscription._id, e.target.value)
            }
            className={`action-select status-${subscription.status}`}
            disabled={subscription.status === "cancelled"}
          >
            <option value="active">Active</option>
            <option value="paused">Pause</option>
            <option value="cancelled">Cancel</option>
          </select>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-8">
      <div className="flex flex-1 gap-4">{renderAnalytics()}</div>

      <div className="filters-section bg-white p-4 rounded-xl shadow-md ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center ">
          {/* Status Filter */}
          <div className="relative group  ">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
              <Filter className="w-5 h-5" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white 
                   transition-all hover:border-blue-400 focus:border-blue-500 
                   focus:ring-2 focus:ring-blue-200 outline-none appearance-none  
                   cursor-pointer h-11"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div
            className="flex items-center h-11 bg-white rounded-lg border border-gray-200 
                    hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 
                    focus-within:ring-blue-200 transition-all"
          >
            <Calendar className="w-5 h-5 text-gray-400 mx-3" />
            <div className="flex items-center gap-2 flex-1 pr-3">
              <input
                type="date"
                className="flex-1 py-2 bg-transparent outline-none border-none 
                     text-sm focus:ring-0 h-full"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
              <span className="text-gray-400">–</span>
              <input
                type="date"
                className="flex-1 py-2 bg-transparent outline-none border-none 
                     text-sm focus:ring-0 h-full"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative group">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 bg-white 
                   transition-all hover:border-blue-400 focus:border-blue-500 
                   focus:ring-2 focus:ring-blue-200 outline-none h-11"
              placeholder="Search order ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="h-screen bg-white px-8 py-4 rounded-md shadow-md overflow-auto">
        <table>
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Plan Info</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4">
                  <div className="flex justify-center items-center">
                    <div
                      className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin"
                      role="status"
                      aria-label="Loading"
                    />
                  </div>
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map(renderSubscriptionRow)
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Showing {subscriptions.length} of {totalRecords}
        </span>
        <div className="pagination-controls">
          <button
            onClick={() => handleFilterChange("page", filters.page - 1)}
            disabled={filters.page === 1}
          >
            Previous
          </button>
          <button
            onClick={() => handleFilterChange("page", filters.page + 1)}
            disabled={subscriptions.length < filters.limit}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
