import React, { useState, useEffect } from "react";
import {
  getAllBranches,
  getTakeAwayConfig,
  createUpdateTakeAwayConfig,
  updateTakeAwayUrl,
  toggleTakeAwayStatus,
  deleteTakeAwayConfig,
  getBranchById,
} from "../utils/api2";
import {
  FaQrcode,
  FaDownload,
  FaTimes,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaLink,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../styles/TakeAwayConfig.css";

const TakeAwayConfig = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedBranchDetails, setSelectedBranchDetails] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [takeAwayConfig, setTakeAwayConfig] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [error, setError] = useState("");

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch takeaway config and branch details when a branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchTakeAwayConfig();
      fetchBranchDetails();
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    const response = await getAllBranches();
    if (response.success) {
      setBranches(response.data);
    }
  };

  const fetchBranchDetails = async () => {
    if (selectedBranch) {
      const response = await getBranchById(selectedBranch);
      if (response.success) {
        setSelectedBranchDetails(response.data);
      }
    }
  };

  const fetchTakeAwayConfig = async () => {
    console.log("Fetching takeaway config for branch:", selectedBranch);
    const response = await getTakeAwayConfig(selectedBranch);
    console.log("Received takeaway config:", response);

    if (response.success) {
      setTakeAwayConfig(response.data.data);
      setBaseUrl(response.data.data.baseUrl || "");
    } else {
      // Config might not exist yet
      setTakeAwayConfig(null);
      setBaseUrl("");
    }
  };

  const handleCreateUpdateConfig = async (e) => {
    e.preventDefault();
    if (!selectedBranch) return;

    // Example: baseUrl would be "http://localhost:5173/takeaway"
    const response = await createUpdateTakeAwayConfig(selectedBranch, {
      baseUrl,
    });

    if (response.success) {
      alert("Takeaway configuration updated successfully");
      fetchTakeAwayConfig();
    } else {
      setError(response.error);
    }
  };

  const handleUpdateUrl = async () => {
    if (!selectedBranch || !takeAwayConfig) return;

    const response = await updateTakeAwayUrl(selectedBranch, baseUrl);
    if (response.success) {
      alert("URL updated successfully");
      fetchTakeAwayConfig();
    } else {
      setError(response.error);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedBranch || !takeAwayConfig) return;

    const response = await toggleTakeAwayStatus(
      selectedBranch,
      !takeAwayConfig.isEnabled
    );
    if (response.success) {
      fetchTakeAwayConfig();
    } else {
      setError(response.error);
    }
  };

  const handleDeleteConfig = async () => {
    if (!selectedBranch || !takeAwayConfig) return;

    const response = await deleteTakeAwayConfig(selectedBranch);
    if (response.success) {
      alert("Takeaway configuration deleted successfully");
      setTakeAwayConfig(null);
      setBaseUrl("");
      setIsConfirmDeleteModalOpen(false);
    } else {
      setError(response.error);
    }
  };

  const openQRModal = () => {
    setIsQRModalOpen(true);
  };

  const downloadQR = () => {
    if (!takeAwayConfig) return;

    const link = document.createElement("a");
    link.href = takeAwayConfig.qrCode;
    link.download = `TakeAway_QR_${
      selectedBranchDetails?.name || "branch"
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="takeaway-dashboard">
      <div className="takeaway-header">
        <h1>Takeaway Configuration</h1>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="takeaway-branch-select"
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
          <div className="takeaway-config-section">
            <div className="takeaway-branch-info">
              <h3>Branch Details</h3>
              <p>Name: {selectedBranchDetails.name}</p>
              <p>Pincode: {selectedBranchDetails.address.pincode}</p>
            </div>

            <div className="takeaway-config-inputs">
              <div className="takeaway-input-group">
                <label>Base URL</label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:5173/takeaway"
                />
                <small className="takeaway-url-preview">
                  Final URL format: {baseUrl}/
                  {selectedBranchDetails.address.pincode}
                </small>
              </div>
              {!takeAwayConfig ? (
                <button
                  onClick={handleCreateUpdateConfig}
                  className="takeaway-update-btn"
                >
                  Create Configuration
                </button>
              ) : (
                <button
                  onClick={handleUpdateUrl}
                  className="takeaway-update-btn"
                >
                  Update URL
                </button>
              )}
            </div>
          </div>

          {takeAwayConfig && (
            <div className="takeaway-view-section">
              <div className="takeaway-view-header">
                <h2>Takeaway QR Code</h2>
              </div>
              <div className="takeaway-box">
                <div className="takeaway-box-header">
                  <h3>{selectedBranchDetails.name} Takeaway</h3>
                  <div className="takeaway-actions">
                    <button
                      className="takeaway-url-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(takeAwayConfig.customUrl);
                        alert("URL copied to clipboard!");
                      }}
                      title="Copy URL"
                    >
                      <FaLink />
                    </button>
                    <button
                      className={`takeaway-toggle-btn ${
                        takeAwayConfig.isEnabled ? "enabled" : ""
                      }`}
                      onClick={handleToggleStatus}
                      title={
                        takeAwayConfig.isEnabled
                          ? "Disable Takeaway"
                          : "Enable Takeaway"
                      }
                    >
                      {takeAwayConfig.isEnabled ? (
                        <FaToggleOn />
                      ) : (
                        <FaToggleOff />
                      )}
                    </button>
                    <button
                      className="takeaway-delete-btn"
                      onClick={() => setIsConfirmDeleteModalOpen(true)}
                      title="Delete Configuration"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div
                  className="takeaway-custom-url"
                  title={takeAwayConfig.customUrl}
                >
                  {takeAwayConfig.customUrl}
                </div>
                <div className="takeaway-qr-container" onClick={openQRModal}>
                  <img src={takeAwayConfig.qrCode} alt="QR Code" />
                </div>
                <div
                  className={`takeaway-status ${
                    takeAwayConfig.isEnabled ? "active" : "disabled"
                  }`}
                >
                  Status: {takeAwayConfig.isEnabled ? "Active" : "Disabled"}
                </div>
                <button className="takeaway-download-btn" onClick={downloadQR}>
                  <FaDownload /> Download QR Code
                </button>
              </div>
            </div>
          )}

          {/* QR Code Modal */}
          {isQRModalOpen && takeAwayConfig && (
            <div className="takeaway-modal-overlay">
              <div className="takeaway-modal">
                <div className="takeaway-modal-header">
                  <h2>Takeaway QR Code: {selectedBranchDetails.name}</h2>
                  <button
                    onClick={() => setIsQRModalOpen(false)}
                    className="takeaway-close-btn"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="takeaway-modal-content takeaway-qr-modal">
                  <img src={takeAwayConfig.qrCode} alt="QR Code" />
                  <p className="takeaway-qr-url">{takeAwayConfig.customUrl}</p>
                  <button
                    onClick={downloadQR}
                    className="takeaway-download-btn"
                  >
                    <FaDownload /> Download QR Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isConfirmDeleteModalOpen && (
            <div className="takeaway-modal-overlay">
              <div className="takeaway-modal">
                <div className="takeaway-modal-header">
                  <h2>Confirm Deletion</h2>
                  <button
                    onClick={() => setIsConfirmDeleteModalOpen(false)}
                    className="takeaway-close-btn"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="takeaway-modal-content">
                  <div className="takeaway-warning-message">
                    <FaExclamationTriangle className="takeaway-warning-icon" />
                    <p>
                      Are you sure you want to delete this takeaway
                      configuration?
                    </p>
                    <p>This action cannot be undone.</p>
                  </div>
                  <div className="takeaway-modal-actions">
                    <button
                      onClick={() => setIsConfirmDeleteModalOpen(false)}
                      className="takeaway-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfig}
                      className="takeaway-delete-confirm-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="takeaway-error-message">{error}</div>}
    </div>
  );
};

export default TakeAwayConfig;
