import React, { useState, useEffect, useCallback } from "react";
import {
  getAllSubscriptions,
  getSubscriptionAnalytics,
  updateSubscriptionStatus,
} from "../utils/api.js";
import { MdOutlineNavigateNext } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";

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
    return Object.entries(analytics).map(([status, data]) => (
      <div
        className={`h-[100px]  ${
          status === "active"
            ? "bg-green-500"
            : status === "paused"
            ? "bg-yellow-500"
            : "bg-red-500"
        } p-4 flex flex-col justify-between flex-1`}
      >
        <div className="">
          <h3 className="text-white text-xl">{status}</h3>
        </div>
        <div className="flex-1 flex  items-center justify-between">
          <div className="flex items-center">
            <span className="count text-2xl text-white font-bold">
              {data?.count || 0}
            </span>
            <span className="label text-white text-md font-semibold ml-2">
              subscriptions
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            SAR {(data?.totalRevenue || 0).toLocaleString()}
          </div>
        </div>
      </div>
    ));
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
      <tr className="bg-white" key={subscription._id}>
        <td className="text-sm">
          <div className="font-semibold">{subscription.orderId}</div>
          <div className="text-sm text-gray-400">
            {subscription.user?.email || "N/A"}
          </div>
        </td>
        <td className="text-sm">
          <div className="grid grid-cols-1  flex-wrap">
            <div className="font-semibold mb-1">
              {subscription.plan?.planId?.nameEnglish ||
                subscription.plan?.name ||
                "N/A"}
            </div>
            <div className="text-gray-400">
              <span className="package">
                {subscription.plan?.selectedPackages?.join(", ") || "N/A"}
              </span>
            </div>
            <div className="text-gray-400">
              {getDurationDisplay(subscription.plan)}
            </div>
          </div>
        </td>
        <td className="text-sm text-center ">
          <div className="status-container ">
            <span
              className={`px-2 py-1 rounded  text-xs font-medium ${
                subscription.status === "active"
                  ? "text-green-500 bg-gray-100"
                  : subscription.status === "paused"
                  ? "text-yellow-500 bg-gray-100"
                  : "text-red-500 bg-gray-100"
              }`}
            >
              {subscription.status}
            </span>
          </div>
        </td>

        <td className="text-sm  flex-1">
          <div className=" flex">
            <div className="font-semibold">
              SAR {(subscription.pricing?.finalAmount || 0).toLocaleString()}
            </div>
            {subscription.pricing?.originalAmount >
              subscription.pricing?.finalAmount && (
              <div className="original-amount">
                <span className="strikethrough">
                  SAR {subscription.pricing.originalAmount.toLocaleString()}
                </span>
              </div>
            )}
            {subscription.pricing?.voucherDiscount > 0 && (
              <div className="discount-container ml-1 text-red-500">
                <div className="discount-amount">
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
        <td className="text-sm">
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
    <div className="bg-white p-6 h-screen overflow-auto">
      <div className="p-6 bg-gray-100">
        <div className="flex w-full gap-4 justify-between">
          {renderAnalytics()}
        </div>

        <div className="p-4 flex ">
          <div className=" w-full flex gap-4 my-4">
            <div className="flex-1 flex gap-1 items-center w-full">
              <IoFilter />

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-2 flex-1 items-center justify-center">
              <div classNmae="">
                <FaCalendarAlt />
              </div>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                placeholder="Start Date"
              />
              <span>To</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                placeholder="End Date"
              />
            </div>

            <div className="search-filter">
              <input
                type="text"
                placeholder="Search order ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <FaSearch />
            </div>
          </div>
        </div>

        <div className="bg-gray-100">
          <table>
            <thead>
              <tr className="">
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
                  <td colSpan="5" className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-red-500 border-solid border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map(renderSubscriptionRow)
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 flex-col items-center justify-center mt-4">
          <span className="text-gray-400">
            Showing {subscriptions.length} of {totalRecords}
          </span>
          <div className="cursor-pointer flex gap-4">
            <button
              className="rotate-180 bg-gray-200 hover:bg-gray-800 cursor-pointer hover:text-white p-4 rounded-full"
              onClick={() => handleFilterChange("page", filters.page - 1)}
              disabled={filters.page === 1}
            >
              <MdOutlineNavigateNext />
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-800 hover:text-white p-4 cursor-pointer rounded-full "
              onClick={() => handleFilterChange("page", filters.page + 1)}
              disabled={subscriptions.length < filters.limit}
            >
              <MdOutlineNavigateNext />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
