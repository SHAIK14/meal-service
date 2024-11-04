import React, { useState, useEffect, useCallback } from "react";
import {
  getAllSubscriptions,
  getSubscriptionAnalytics,
  updateSubscriptionStatus,
} from "../utils/api.js";
import { Calendar, Search, Filter } from "lucide-react";
import "../styles/Subscriptions.css";

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
      <div key={status} className="analytics-card">
        <div className="analytics-header">
          <h3>{status}</h3>
          <span className={`status-dot status-${status}`} />
        </div>
        <div className="analytics-body">
          <div className="analytics-main">
            <span className="count">{data?.count || 0}</span>
            <span className="label">subscriptions</span>
          </div>
          <div className="analytics-revenue">
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
      <tr key={subscription._id}>
        <td className="id-cell">
          <div className="order-id">{subscription.orderId}</div>
          <div className="user-email">{subscription.user?.email || "N/A"}</div>
        </td>
        <td>
          <div className="plan-details">
            <div className="plan-name">
              {subscription.plan?.planId?.nameEnglish ||
                subscription.plan?.name ||
                "N/A"}
            </div>
            <div className="meta-info">
              <span className="package">
                {subscription.plan?.selectedPackages?.join(", ") || "N/A"}
              </span>
            </div>
            <div className="duration-info">
              {getDurationDisplay(subscription.plan)}
            </div>
          </div>
        </td>
        <td>
          <div className="status-container">
            <span className={`status status-${subscription.status}`}>
              {subscription.status}
            </span>
          </div>
        </td>
        <td>
          <div className="amount-container">
            <div className="amount">
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
              <div className="discount-container">
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
    <div className="subscriptions-container">
      <div className="analytics-section">{renderAnalytics()}</div>

      <div className="filters-section">
        <div className="filters-group">
          <div className="filter-item">
            <Filter className="icon" size={16} />
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

          <div className="date-filters">
            <Calendar className="icon" size={16} />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              placeholder="Start Date"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              placeholder="End Date"
            />
          </div>

          <div className="search-filter">
            <Search className="icon" size={16} />
            <input
              type="text"
              placeholder="Search order ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
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
                <td colSpan="5" className="loading">
                  Loading...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty">
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
