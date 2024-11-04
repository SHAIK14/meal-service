import React, { useState, useEffect, useCallback } from "react";
import { getAllUsers, getUserAnalytics } from "../utils/api";
import { Search, Filter, Users as UsersIcon } from "lucide-react";
import "../styles/Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    newUsersToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    isSubscribed: "",
    page: 1,
    limit: 10,
  });
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(filters);

      if (response.success) {
        setUsers(response.users || []);
        setTotalRecords(response.pagination?.total || 0);
      } else {
        setUsers([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await getUserAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, [fetchUsers, fetchAnalytics]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "page" ? value : 1,
    }));
  };

  const renderAnalytics = () => {
    const cards = [
      {
        title: "Total Registered Users",
        value: analytics.totalUsers,
        icon: <UsersIcon size={20} />,
      },
      {
        title: "Active Subscribers",
        value: analytics.activeSubscribers,
        icon: <UsersIcon size={20} />,
      },
      {
        title: "New Users Today",
        value: analytics.newUsersToday,
        icon: <UsersIcon size={20} />,
      },
    ];

    return (
      <div className="analytics-section">
        {cards.map((card, index) => (
          <div key={index} className="analytics-card">
            <div className="analytics-header">
              <h3>{card.title}</h3>
              {card.icon}
            </div>
            <div className="analytics-value">{card.value}</div>
          </div>
        ))}
      </div>
    );
  };

  const getActiveSubscriptionsCount = (user) => {
    return user.subscriptions?.active?.length || 0;
  };

  const renderUserRow = (user) => {
    if (!user) return null;

    const activeSubscriptionsCount = getActiveSubscriptionsCount(user);

    return (
      <tr key={user._id}>
        <td>
          <div className="user-phone">{user.phoneNumber}</div>
          <div className="user-email">{user.email || "N/A"}</div>
        </td>
        <td>
          <div className="user-name">
            {user.firstName} {user.lastName}
          </div>
        </td>
        <td>
          <div className="subscription-status">
            <span
              className={`badge ${user.isSubscribed ? "active" : "inactive"}`}
            >
              {user.isSubscribed ? "Subscribed" : "Not Subscribed"}
            </span>
          </div>
        </td>
        <td>
          <div className="active-plans">
            {activeSubscriptionsCount} Active Plan
            {activeSubscriptionsCount !== 1 ? "s" : ""}
          </div>
        </td>
        <td>
          <div className="date">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="users-container">
      {renderAnalytics()}

      <div className="filters-section">
        <div className="filters-group">
          <div className="filter-item">
            <Filter className="icon" size={16} />
            <select
              value={filters.isSubscribed}
              onChange={(e) =>
                handleFilterChange("isSubscribed", e.target.value)
              }
            >
              <option value="">All Registered Users</option>
              <option value="true">Users with Subscription</option>
            </select>
          </div>

          <div className="search-filter">
            <Search className="icon" size={16} />
            <input
              type="text"
              placeholder="Search by name or phone number..."
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
              <th>Contact Info</th>
              <th>Name</th>
              <th>Subscription Status</th>
              <th>Active Plans</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(renderUserRow)
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Showing {users.length} of {totalRecords}
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
            disabled={users.length < filters.limit}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;
