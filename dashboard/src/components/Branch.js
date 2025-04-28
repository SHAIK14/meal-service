import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
// import "../styles/Branch.css";
import {
  getAllBranches,
  deleteBranch,
  changeBranchPassword,
} from "../utils/api2";

const Branch = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await getAllBranches();
      if (response.success) {
        setBranches(response.data);
      } else {
        setError(response.error || "Failed to fetch branches");
      }
    } catch (err) {
      setError("Error fetching branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDelete = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      const response = await deleteBranch(branchId);
      if (response.success) {
        fetchBranches();
      }
    }
  };

  const handleShowPasswordModal = (branch) => {
    setSelectedBranch(branch);
    setShowPasswordModal(true);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const response = await changeBranchPassword(
        selectedBranch._id,
        newPassword
      );
      if (response.success) {
        setShowPasswordModal(false);
        fetchBranches();
      } else {
        setPasswordError(response.error || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("Error changing password");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bg-white  text-gray-800 p-6 h-screen overflow-y-scroll ">
      <div className="bg-gray-100 p-6 h-full ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold ">Branch Management</h2>
          <button
            className="flex items-center gap-2 bg-gray-100 px-4 py-3 text-sm hover:bg-gray-800 hover:text-white transition-all ease-in-out duration-300 font-semibold"
            onClick={() => navigate("/branches/add")}
          >
            <FaPlus /> Add New Branch
          </button>
        </div>

        <div className="bg-gray-100">
          <table className="text-sm">
            <thead className="bg-gray-200 ">
              <tr>
                <th>Branch Name</th>
                <th>CR Number</th>
                <th>Municipality Number</th>
                <th>VAT Number</th>
                <th>Service Radius</th>
                <th>Username/Pincode</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {branches.map((branch) => (
                <tr key={branch._id}>
                  <td>{branch.name}</td>
                  <td>{branch.crNumber}</td>
                  <td>{branch.municipalityNumber}</td>
                  <td>{branch.vatNumber}</td>
                  <td>{branch.serviceRadius} km</td>
                  <td>{branch.address.pincode}</td>
                  <td className=" flex items-center justify-center">
                    <div className="flex space-x-8">
                      {/* Change Password Button */}
                      <div className="relative group">
                        <button
                          className="hover:text-green-500"
                          onClick={() => handleShowPasswordModal(branch)}
                        >
                          <FaKey />
                        </button>
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-center text-xs rounded px-2 py-1">
                          Change Password
                        </span>
                      </div>

                      {/* Edit Button */}
                      <div className="relative group">
                        <button
                          className="hover:text-blue-500"
                          onClick={() =>
                            navigate(`/branches/edit/${branch._id}`)
                          }
                        >
                          <FaEdit />
                        </button>
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                          Edit
                        </span>
                      </div>

                      {/* Delete Button */}
                      <div className="relative group">
                        <button
                          className="hover:text-red-500 "
                          onClick={() => handleDelete(branch._id)}
                        >
                          <FaTrash />
                        </button>
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                          Delete
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && selectedBranch && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                {passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-save">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Branch;
