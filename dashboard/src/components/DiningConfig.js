import React, { useState, useEffect } from "react";
import {
  getAllBranches,
  getDiningConfig,
  createUpdateDiningConfig,
  addTable,
  deleteTable,
  toggleTableStatus,
  getBranchById, // Add this import
} from "../utils/api2";
import {
  FaPlus,
  FaQrcode,
  FaDownload,
  FaTimes,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaLink, // Add this for URL display
} from "react-icons/fa";
import "../styles/DiningConfig.css";

const DiningConfig = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedBranchDetails, setSelectedBranchDetails] = useState(null); // Add this state
  const [diningRadius, setDiningRadius] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [tables, setTables] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTableName, setNewTableName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchDiningConfig();
      fetchBranchDetails();
    }
  }, [selectedBranch]);

  const fetchBranchDetails = async () => {
    if (selectedBranch) {
      const response = await getBranchById(selectedBranch);
      if (response.success) {
        setSelectedBranchDetails(response.data);
      }
    }
  };

  const fetchBranches = async () => {
    const response = await getAllBranches();
    if (response.success) {
      setBranches(response.data);
    }
  };

  const fetchDiningConfig = async () => {
    console.log("Fetching config for branch:", selectedBranch);
    const response = await getDiningConfig(selectedBranch);
    console.log("Received config:", response);

    if (response.success) {
      const {
        diningRadius: radius,
        baseUrl: url,
        tables: existingTables,
      } = response.data.data;

      setDiningRadius(radius || "");
      setBaseUrl(url || "");
      setTables(existingTables || []);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    if (!selectedBranch) return;

    const response = await createUpdateDiningConfig(selectedBranch, {
      diningRadius: Number(diningRadius),
      baseUrl,
    });

    if (response.success) {
      alert("Configuration updated successfully");
      fetchDiningConfig();
    } else {
      setError(response.error);
    }
  };

  const handleAddTable = async () => {
    if (!baseUrl) {
      alert("Please set a base URL first");
      return;
    }

    const response = await addTable(selectedBranch, { name: newTableName });
    if (response.success) {
      setNewTableName("");
      setIsAddModalOpen(false);
      fetchDiningConfig();
    } else {
      setError(response.error);
    }
  };
  const handleDeleteTable = async (e, tableId) => {
    e.stopPropagation(); // Prevent QR modal from opening
    if (window.confirm("Are you sure you want to delete this table?")) {
      const response = await deleteTable(selectedBranch, tableId);
      if (response.success) {
        fetchDiningConfig();
      } else {
        setError(response.error);
      }
    }
  };

  const handleToggleStatus = async (e, tableId, currentStatus) => {
    e.stopPropagation(); // Prevent QR modal from opening
    const response = await toggleTableStatus(
      selectedBranch,
      tableId,
      !currentStatus
    );
    if (response.success) {
      fetchDiningConfig();
    } else {
      setError(response.error);
    }
  };

  const openQRModal = (table) => {
    setSelectedTable(table);
    setIsQRModalOpen(true);
  };

  const downloadQR = (table) => {
    const link = document.createElement("a");
    link.href = table.qrCode;
    link.download = `QR_${table.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dining-dashboard">
      <div className="dashboard-header">
        <h1>Dining Configuration</h1>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="branch-select"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {selectedBranch && selectedBranchDetails && (
        <>
          <div className="config-section">
            <div className="branch-info">
              <h3>Branch Details</h3>
              <p>Name: {selectedBranchDetails.name}</p>
              <p>Pincode: {selectedBranchDetails.address.pincode}</p>
            </div>

            <div className="config-inputs">
              <div className="input-group">
                <label>Dining Radius (km)</label>
                <input
                  type="number"
                  value={diningRadius}
                  onChange={(e) => setDiningRadius(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Base URL</label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://example.com/menu"
                />
                <small className="url-preview">
                  Final URL format: {baseUrl}/
                  {selectedBranchDetails.address.pincode}/[table-name]
                </small>
              </div>
              <button onClick={handleUpdateConfig} className="update-btn">
                Update Configuration
              </button>
            </div>
          </div>

          <div className="tables-section">
            <div className="tables-header">
              <h2>Tables</h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="add-table-btn"
                disabled={!baseUrl}
              >
                <FaPlus /> New Table
              </button>
            </div>

            <div className="tables-grid">
              {tables.map((table) => (
                <div
                  key={table._id}
                  className="table-box"
                  onClick={() => openQRModal(table)}
                >
                  <div className="table-header">
                    <h3>{table.name}</h3>
                    <div className="table-actions">
                      <button
                        className="url-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(table.customUrl);
                          alert("URL copied to clipboard!");
                        }}
                        title="Copy URL"
                      >
                        <FaLink />
                      </button>
                      <button
                        className={`toggle-btn ${
                          table.isEnabled ? "enabled" : ""
                        }`}
                        onClick={(e) =>
                          handleToggleStatus(e, table._id, table.isEnabled)
                        }
                        title={
                          table.isEnabled ? "Disable Table" : "Enable Table"
                        }
                      >
                        {table.isEnabled ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteTable(e, table._id)}
                        title="Delete Table"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="table-url" title={table.customUrl}>
                    {table.customUrl}
                  </div>
                  <FaQrcode className="qr-icon" />
                  <div className="table-status">
                    Status: {table.isEnabled ? "Active" : "Disabled"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Table Modal */}
          {isAddModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Add New Table</h2>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="close-btn"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-content">
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name (e.g., T1)"
                  />
                  <button onClick={handleAddTable} className="primary-btn">
                    Add Table
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Modal */}
          {isQRModalOpen && selectedTable && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Table QR Code: {selectedTable.name}</h2>
                  <button
                    onClick={() => setIsQRModalOpen(false)}
                    className="close-btn"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-content qr-modal">
                  <img src={selectedTable.qrCode} alt="QR Code" />
                  <p className="qr-url">{selectedTable.customUrl}</p>
                  <button
                    onClick={() => downloadQR(selectedTable)}
                    className="download-btn"
                  >
                    <FaDownload /> Download QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DiningConfig;
