import React, { useState, useEffect } from "react";
import { getBranchTables, updateTableStatus } from "../utils/api";
import "../styles/TableManagement.css";

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await getBranchTables();
        console.log("Tables response:", response); // For debugging
        if (response.success) {
          // Set default status if not present
          const tablesWithStatus = response.data.data.map((table) => ({
            ...table,
            status: table.status || "available", // Default to available if no status
          }));
          setTables(tablesWithStatus);
        } else {
          setError(response.message);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Error fetching tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Rest of your code remains the same
  const handleTableStatusChange = async (tableId, newStatus) => {
    try {
      const response = await updateTableStatus(tableId, newStatus);
      if (response.success) {
        setTables(
          tables.map((table) => {
            if (table.id === tableId) {
              return { ...table, status: newStatus };
            }
            return table;
          })
        );
      } else {
        alert(response.message || "Failed to update table status");
      }
    } catch (error) {
      alert("Error updating table status");
    }
  };

  // Debug tables data
  console.log("Current tables:", tables);

  if (loading) return <div className="loading-message">Loading tables...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="table-management-container">
      <div className="table-management-header">
        <h1>Table Management</h1>
      </div>

      <div className="tables-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-card ${(
              table.status || "available"
            ).toLowerCase()}`}
          >
            <div className="table-header">
              <h2>{table.name}</h2>
              <span
                className={`status-badge ${(
                  table.status || "available"
                ).toLowerCase()}`}
              >
                {table.status || "Available"}
              </span>
            </div>

            <div className="table-actions">
              {(table.status || "available") === "available" ? (
                <button
                  className="occupy-btn"
                  onClick={() => handleTableStatusChange(table.id, "occupied")}
                >
                  Mark as Occupied
                </button>
              ) : (
                <button
                  className="available-btn"
                  onClick={() => handleTableStatusChange(table.id, "available")}
                >
                  Mark as Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableManagement;
