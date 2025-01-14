import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllDrivers, approveDriver, deleteDriver } from "../utils/api2";
import "../styles/DriverManagement.css";
import { useNavigate } from "react-router-dom";
const DriverManagement = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [driversPerPage] = useState(10);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await getAllDrivers();
      if (response.success) {
        setDrivers(response.data);
        setError(null);
      } else {
        setError(response.error);
        toast.error(response.error);
      }
    } catch (error) {
      setError("Failed to fetch drivers");
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleApprove = async (driverId) => {
    try {
      const response = await approveDriver(driverId);
      if (response.success) {
        toast.success("Driver approved successfully");
        setSelectedCredentials(response.credentials);
        setShowCredentials(true);
        fetchDrivers();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Failed to approve driver");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteDriver(selectedDriverId);
      if (response.success) {
        toast.success("Driver deleted successfully");
        setShowDeleteConfirm(false);
        fetchDrivers();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Failed to delete driver");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = drivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const totalPages = Math.ceil(drivers.length / driversPerPage);

  return (
    <div className="dm-container">
      <h2 className="dm-title">Driver Management</h2>

      {loading ? (
        <div className="dm-loading">Please wait...</div>
      ) : error ? (
        <div className="dm-error">{error}</div>
      ) : (
        <>
          <div className="dm-table-wrapper">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Driver ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>National ID</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDrivers.map((driver) => (
                  <tr key={driver.driverId}>
                    <td>{driver.driverId}</td>
                    <td>{driver.personalDetails.fullName}</td>
                    <td>{driver.personalDetails.mobile}</td>
                    <td>
                      <span className={`dm-status ${driver.status}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td>{driver.personalDetails.nationalId}</td>
                    <td>
                      {new Date(
                        driver.personalDetails.joiningDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="dm-actions">
                      <div className="dm-actions-group">
                        {driver.status === "pending" ? (
                          <button
                            className="dm-btn dm-approve"
                            onClick={() => handleApprove(driver.driverId)}
                          >
                            Approve
                          </button>
                        ) : (
                          driver.status === "approved" &&
                          driver.authDetails?.isFirstLogin && (
                            <button
                              className="dm-btn dm-credentials"
                              onClick={() => {
                                setSelectedCredentials({
                                  username: driver.personalDetails.nationalId,

                                  temporaryPassword:
                                    driver.authDetails.temporaryPassword,
                                });
                                setShowCredentials(true);
                              }}
                            >
                              Credentials
                            </button>
                          )
                        )}
                        <button
                          className="dm-btn dm-update"
                          onClick={() =>
                            navigate(`/driver/edit/${driver.driverId}`)
                          }
                        >
                          Update
                        </button>
                        <button
                          className="dm-btn dm-delete"
                          onClick={() => {
                            setSelectedDriverId(driver.driverId);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="dm-pagination">
              <button
                className="dm-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="dm-page-info">
                {currentPage} of {totalPages}
              </span>
              <button
                className="dm-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showCredentials && selectedCredentials && (
        <div className="dm-modal">
          <div className="dm-modal-content">
            <div className="dm-modal-header">
              <h3>Driver Login Details</h3>
            </div>
            <div className="dm-modal-body">
              <div className="dm-credential-row">
                <label>Username</label>
                <div className="dm-credential-value">
                  <span>{selectedCredentials.username}</span>
                  <button
                    onClick={() => handleCopy(selectedCredentials.username)}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="dm-credential-row">
                <label>Password</label>
                <div className="dm-credential-value">
                  <span>{selectedCredentials.temporaryPassword}</span>
                  <button
                    onClick={() =>
                      handleCopy(selectedCredentials.temporaryPassword)
                    }
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="dm-modal-footer">
              <button
                className="dm-btn"
                onClick={() => setShowCredentials(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="dm-modal">
          <div className="dm-modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this driver?</p>
            <div className="dm-modal-actions">
              <button className="dm-btn dm-delete" onClick={handleDelete}>
                Delete
              </button>
              <button
                className="dm-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
