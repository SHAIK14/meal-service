import React, { useState, useEffect } from "react";
import {
  getAllBranches,
  getCateringConfig,
  createUpdateCateringConfig,
  updateCateringUrl,
  toggleCateringStatus,
  deleteCateringConfig,
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
import "../styles/CateringConfig.css"; // Use separate CSS file

const CateringConfig = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedBranchDetails, setSelectedBranchDetails] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [cateringConfig, setCateringConfig] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [error, setError] = useState("");

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch catering config and branch details when a branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchCateringConfig();
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

  const fetchCateringConfig = async () => {
    console.log("Fetching catering config for branch:", selectedBranch);
    const response = await getCateringConfig(selectedBranch);
    console.log("Received catering config:", response);

    if (response.success) {
      setCateringConfig(response.data.data);
      setBaseUrl(response.data.data.baseUrl || "");
    } else {
      // Config might not exist yet
      setCateringConfig(null);
      setBaseUrl("");
    }
  };

  const handleCreateUpdateConfig = async (e) => {
    e.preventDefault();
    if (!selectedBranch) return;

    // Example: baseUrl would be "http://localhost:5173/catering"
    const response = await createUpdateCateringConfig(selectedBranch, {
      baseUrl,
    });

    if (response.success) {
      alert("Catering configuration updated successfully");
      fetchCateringConfig();
    } else {
      setError(response.error);
    }
  };

  const handleUpdateUrl = async () => {
    if (!selectedBranch || !cateringConfig) return;

    const response = await updateCateringUrl(selectedBranch, baseUrl);
    if (response.success) {
      alert("URL updated successfully");
      fetchCateringConfig();
    } else {
      setError(response.error);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedBranch || !cateringConfig) return;

    const response = await toggleCateringStatus(
      selectedBranch,
      !cateringConfig.isEnabled
    );
    if (response.success) {
      fetchCateringConfig();
    } else {
      setError(response.error);
    }
  };

  const handleDeleteConfig = async () => {
    if (!selectedBranch || !cateringConfig) return;

    const response = await deleteCateringConfig(selectedBranch);
    if (response.success) {
      alert("Catering configuration deleted successfully");
      setCateringConfig(null);
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
    if (!cateringConfig) return;

    const link = document.createElement("a");
    link.href = cateringConfig.qrCode;
    link.download = `Catering_QR_${
      selectedBranchDetails?.name || "branch"
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="catering-dashboard">
      <div className="catering-header">
        <h1>Catering Configuration</h1>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="catering-branch-select"
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
          <div className="catering-config-section">
            <div className="catering-branch-info">
              <h3>Branch Details</h3>
              <p>Name: {selectedBranchDetails.name}</p>
              <p>Pincode: {selectedBranchDetails.address.pincode}</p>
            </div>

            <div className="catering-config-inputs">
              <div className="catering-input-group">
                <label>Base URL</label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:5173/catering"
                />
                <small className="catering-url-preview">
                  Final URL format: {baseUrl}/
                  {selectedBranchDetails.address.pincode}
                </small>
              </div>
              {!cateringConfig ? (
                <button
                  onClick={handleCreateUpdateConfig}
                  className="catering-update-btn"
                >
                  Create Configuration
                </button>
              ) : (
                <button
                  onClick={handleUpdateUrl}
                  className="catering-update-btn"
                >
                  Update URL
                </button>
              )}
            </div>
          </div>

          {cateringConfig && (
            <div className="catering-view-section">
              <div className="catering-view-header">
                <h2>Catering QR Code</h2>
              </div>
              <div className="catering-box">
                <div className="catering-box-header">
                  <h3>{selectedBranchDetails.name} Catering</h3>
                  <div className="catering-actions">
                    <button
                      className="catering-url-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(cateringConfig.customUrl);
                        alert("URL copied to clipboard!");
                      }}
                      title="Copy URL"
                    >
                      <FaLink />
                    </button>
                    <button
                      className={`catering-toggle-btn ${
                        cateringConfig.isEnabled ? "enabled" : ""
                      }`}
                      onClick={handleToggleStatus}
                      title={
                        cateringConfig.isEnabled
                          ? "Disable Catering"
                          : "Enable Catering"
                      }
                    >
                      {cateringConfig.isEnabled ? (
                        <FaToggleOn />
                      ) : (
                        <FaToggleOff />
                      )}
                    </button>
                    <button
                      className="catering-delete-btn"
                      onClick={() => setIsConfirmDeleteModalOpen(true)}
                      title="Delete Configuration"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div
                  className="catering-custom-url"
                  title={cateringConfig.customUrl}
                >
                  {cateringConfig.customUrl}
                </div>
                <div className="catering-qr-container" onClick={openQRModal}>
                  <img src={cateringConfig.qrCode} alt="QR Code" />
                </div>
                <div
                  className={`catering-status ${
                    cateringConfig.isEnabled ? "active" : "disabled"
                  }`}
                >
                  Status: {cateringConfig.isEnabled ? "Active" : "Disabled"}
                </div>
                <button className="catering-download-btn" onClick={downloadQR}>
                  <FaDownload /> Download QR Code
                </button>
              </div>
            </div>
          )}

          {/* QR Code Modal */}
          {isQRModalOpen && cateringConfig && (
            <div className="catering-modal-overlay">
              <div className="catering-modal">
                <div className="catering-modal-header">
                  <h2>Catering QR Code: {selectedBranchDetails.name}</h2>
                  <button
                    onClick={() => setIsQRModalOpen(false)}
                    className="catering-close-btn"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="catering-modal-content catering-qr-modal">
                  <img src={cateringConfig.qrCode} alt="QR Code" />
                  <p className="catering-qr-url">{cateringConfig.customUrl}</p>
                  <button
                    onClick={downloadQR}
                    className="catering-download-btn"
                  >
                    <FaDownload /> Download QR Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isConfirmDeleteModalOpen && (
            <div className="catering-modal-overlay">
              <div className="catering-modal">
                <div className="catering-modal-header">
                  <h2>Confirm Deletion</h2>
                  <button
                    onClick={() => setIsConfirmDeleteModalOpen(false)}
                    className="catering-close-btn"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="catering-modal-content">
                  <div className="catering-warning-message">
                    <FaExclamationTriangle className="catering-warning-icon" />
                    <p>
                      Are you sure you want to delete this catering
                      configuration?
                    </p>
                    <p>This action cannot be undone.</p>
                  </div>
                  <div className="catering-modal-actions">
                    <button
                      onClick={() => setIsConfirmDeleteModalOpen(false)}
                      className="catering-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfig}
                      className="catering-delete-confirm-btn"
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

      {error && <div className="catering-error-message">{error}</div>}
    </div>
  );
};

export default CateringConfig;
