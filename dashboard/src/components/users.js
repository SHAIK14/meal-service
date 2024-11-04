<<<<<<< HEAD
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Dummy user data
  const userList = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", email: "alice@example.com" },
    { id: 4, name: "Bob Brown", email: "bob@example.com" },
  ];

  // Dummy order data
  const orders = [
    { orderId: "A1001", dateModified: "2023-10-01", amount: "$150" },
    { orderId: "A1002", dateModified: "2023-10-03", amount: "$200" },
    { orderId: "A1003", dateModified: "2023-10-05", amount: "$250" },
  ];

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  const goToInvoice = () => {
    navigate("/invoice");
  };

  const closeUserModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setActiveTab("details");
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.text(`Invoice for ${selectedUser.name}`, 10, 10);
    orders.forEach((order, index) => {
      doc.text(
        `Order ID: ${order.orderId} | Date: ${order.dateModified} | Amount: ${order.amount}`,
        10,
        20 + index * 10
      );
    });
    doc.save("invoice.pdf");
  };

  return (
    <div>
      <h1>Users Page</h1>
      <ul>
        {userList.map((user) => (
          <li
            key={user.id}
            onClick={() => openUserModal(user)}
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            {user.name} (ID: {user.id})
          </li>
        ))}
      </ul>
      <div className="invoice-btn">
        <button onClick={goToInvoice}>Invoice</button>
      </div>
      {/* Modal Popup */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={closeUserModal}
            style={{ float: "right", cursor: "pointer" }}
          >
            X
          </button>
          <h2>{selectedUser.name}'s Information</h2>

          {/* Tab Navigation */}
          <div style={{ display: "flex", marginBottom: "20px" }}>
            <button
              onClick={() => setActiveTab("details")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "details" ? "#eee" : "#fff",
              }}
            >
              User Details
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "orders" ? "#eee" : "#fff",
              }}
            >
              Order Summary
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "details" && (
            <div>
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <ul>
                {orders
                  .sort(
                    (a, b) =>
                      new Date(b.dateModified) - new Date(a.dateModified)
                  )
                  .map((order) => (
                    <li key={order.orderId}>
                      {order.orderId} - {order.dateModified} - {order.amount}
                    </li>
                  ))}
              </ul>
              <button onClick={downloadInvoice}>Download Invoice</button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={closeUserModal}
        />
      )}
=======
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
>>>>>>> upstream/master
    </div>
  );
};

export default Users;
