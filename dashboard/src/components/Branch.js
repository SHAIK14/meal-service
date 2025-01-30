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
    <div className=" bg-white flex flex-col gap-4 p-8 h-screen">
      <div className="flex items-center bg-gray-100 justify-between rounded-2xl p-4">
        <h2 className="text-3xl font-semibold m-0 p-0">Branch Management</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-500 text-sm font-semibold text-black hover:text-white transition-all duration-300 bg-gray-200"
          onClick={() => navigate("/branches/add")}
        >
          <FaPlus /> Add New Branch
        </button>
      </div>

      <div className=" min-h-[400px] max-h-[600px]   rounded-2xl shadow-lg overflow-auto">
        <table className="w-full table-auto">
          <thead className="  text-gray-700">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-medium">
                Branch Name
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium">
                CR Number
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium">
                Municipality Number
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium">
                VAT Number
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium">
                Service Radius
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium">
                Username/Pincode
              </th>
              <th className="py-3 px-6 text-center text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {branches.map((branch) => (
              <tr
                className=" border-gray-200  hover:bg-blue-100"
                key={branch._id}
              >
                <td className=" px-6 font-semibold  text-sm">{branch.name}</td>
                <td className=" px-6 text-sm">{branch.crNumber}</td>
                <td className=" px-6 text-sm">{branch.municipalityNumber}</td>
                <td className=" px-6 text-sm">{branch.vatNumber}</td>
                <td className=" px-6 text-sm">{branch.serviceRadius} km</td>
                <td className=" px-6 text-sm">{branch.address.pincode}</td>
                <td className=" px-6  flex items-center justify-center  ">
                  <div className="button-group flex items-center justify-center space-x-2">
                    <button
                      className="relative bg-yellow-500 text-sm p-2 text-white rounded-full hover:bg-yellow-600 transition-all duration-300 group"
                      onClick={() => handleShowPasswordModal(branch)}
                    >
                      <FaKey />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs text-white bg-black rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 group-hover:block transition-opacity duration-300">
                        Change Password
                      </span>
                    </button>
                    <button
                      className="relative bg-blue-500 text-sm p-2 text-white rounded-full hover:bg-blue-600 transition-all duration-300 group"
                      onClick={() => navigate(`/branches/edit/${branch._id}`)}
                    >
                      <FaEdit />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs text-white bg-black rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 group-hover:block transition-opacity duration-300">
                        Edit Branch
                      </span>
                    </button>
                    <button
                      className="relative bg-red-500 text-sm p-2 text-white rounded-full hover:bg-red-600 transition-all duration-300 group"
                      onClick={() => handleDelete(branch._id)}
                    >
                      <FaTrash />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs text-white bg-black rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 group-hover:block transition-opacity duration-300">
                        Delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && selectedBranch && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="modal bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-2xl font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              {passwordError && (
                <div className="error-message text-red-500 mb-4">
                  {passwordError}
                </div>
              )}
              <div className="form-group mb-6">
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <div className=" flex items-center border  border-gray-300 rounded-lg">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-4 text-sm rounded-l-lg focus:outline-none"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="toggle-password p-2  rounded-r-lg"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>
              <div className="form-group mb-6">
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="password-input-group flex items-center border border-gray-300 rounded-lg">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-2 text-sm rounded-l-lg focus:outline-none"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="toggle-password p-2  rounded-r-lg"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>
              <div className="modal-actions flex justify-between mt-6">
                <button
                  type="submit"
                  className="btn-save bg-green-600 text-white py-2  font-semibold px-6 rounded-full text-sm hover:bg-green-700 transition-all duration-300"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn-cancel bg-gray-100 text-black py-2 px-6 rounded-full text-sm hover:bg-gray-400 transition-all duration-300"
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
  );
};

export default Branch;
