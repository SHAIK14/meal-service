import React, { useState, useEffect } from "react";
import {
  getAllStaff,
  getAllBranches,
  getAllRoles,
  getAllServices,
  updateStaffPassword,
  updateStaff,
  updateStaffServices,
} from "../utils/api2";
import { FaUserEdit } from "react-icons/fa";
import { MdMiscellaneousServices } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

const StaffList = () => {
  // States for data
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // States for modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  // States for editing
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [editFormData, setEditFormData] = useState({
    role: "",
    branch: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectAllServices, setSelectAllServices] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, branchRes, roleRes, servicesRes] = await Promise.all([
        getAllStaff(),
        getAllBranches(),
        getAllRoles(),
        getAllServices(),
      ]);

      if (staffRes.success) setStaffList(staffRes.data);
      if (branchRes.success) setBranches(branchRes.data);
      if (roleRes.success) setRoles(roleRes.data);
      if (servicesRes.success) setServices(servicesRes.data);
    } catch (error) {
      setError("Error fetching data");
    }
    setLoading(false);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setEditFormData({
      role: staff.role?._id || "",
      branch: staff.branch?._id || "",
    });
    setShowEditModal(true);
  };

  const handleEditServices = (staff) => {
    setSelectedStaff(staff);
    setSelectedServices(staff.services || []);
    setSelectAllServices((staff.services || []).length === services.length);
    setShowServicesModal(true);
  };

  const handlePasswordChange = (staff) => {
    setSelectedStaff(staff);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleServiceChange = (serviceId) => {
    if (serviceId === "all") {
      const allServiceIds = selectAllServices
        ? []
        : services.map((service) => service._id);
      setSelectAllServices(!selectAllServices);
      setSelectedServices(allServiceIds);
    } else {
      setSelectedServices((prev) => {
        const updated = prev.includes(serviceId)
          ? prev.filter((id) => id !== serviceId)
          : [...prev, serviceId];
        setSelectAllServices(updated.length === services.length);
        return updated;
      });
    }
  };
  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;

    try {
      const result = await updateStaff(selectedStaff._id, editFormData);
      if (result.success) {
        setSuccessMessage("Staff updated successfully");
        setShowEditModal(false);
        fetchData(); // Refresh list
      } else {
        setError(result.error || "Failed to update staff");
      }
    } catch (error) {
      setError("An error occurred while updating staff");
    }
  };

  const handleUpdateServices = async () => {
    if (!selectedStaff) return;

    try {
      const result = await updateStaffServices(
        selectedStaff._id,
        selectedServices
      );
      if (result.success) {
        setSuccessMessage("Services updated successfully");
        setShowServicesModal(false);
        fetchData(); // Refresh list
      } else {
        setError(result.error || "Failed to update services");
      }
    } catch (error) {
      setError("An error occurred while updating services");
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedStaff || !newPassword) return;

    try {
      const result = await updateStaffPassword(selectedStaff._id, newPassword);
      if (result.success) {
        setSuccessMessage("Password updated successfully");
        setShowPasswordModal(false);
        setNewPassword("");
        setSelectedStaff(null);
      } else {
        setError(result.error || "Failed to update password");
      }
    } catch (error) {
      setError("An error occurred while updating password");
    }
  };

  return (
    <div className="p-6 bg-white h-screen">
      <div className="bg-gray-100 text-gray-800 rounded-lg h-[450px] overflow-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Staff List</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-200">
            <thead className=" rounded-lg">
              <tr className="">
                <th className="text-left p-2 border-b border-b-gray-400  ">
                  Name
                </th>
                <th className="text-left p-2 border-b border-b-gray-400">
                  Email
                </th>
                <th className="text-left p-2 border-b border-b-gray-400">
                  Phone
                </th>
                <th className="text-left p-2 border-b border-b-gray-400">
                  Username
                </th>
                <th className="text-left p-2 border-b border-b-gray-400">
                  Branch
                </th>
                <th className="text-left p-2 border-b border-b-gray-400">
                  Role
                </th>
                <th className="text-left p-2 border-b border-b-gray-400">
                  Services
                </th>
                <th className="p-2 text-center border-b border-b-gray-400 rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {staffList.map((staff) => (
                <tr key={staff._id}>
                  <td className="p-2 ">{staff.name}</td>
                  <td className="p-2 ">{staff.email}</td>
                  <td className="p-2 ">{staff.phone}</td>
                  <td className="p-2 ">{staff.username}</td>
                  <td className="p-2 ">{staff.branch?.name}</td>
                  <td className="p-2 ">{staff.role?.name}</td>
                  <td className="p-2 ">
                    {staff.services?.length || 0} services
                  </td>
                  <td className="p-2 border-b text-center  flex items-center justify-center">
                    <div className="flex space-x-2">
                      {/* Edit Button */}
                      <div className="relative group">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="hover:text-green-500 transition-all ease-in-out duration-200 text-gray-800 px-3 py-1 rounded"
                        >
                          <FaUserEdit />
                          {/* Tooltip */}
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                            Edit
                          </span>
                        </button>
                      </div>

                      {/* Services Button */}
                      <div className="relative group">
                        <button
                          onClick={() => handleEditServices(staff)}
                          className="hover:text-blue-700 transition-all ease-in-out duration-200 text-gray-800 px-3 py-1 rounded"
                        >
                          <MdMiscellaneousServices />
                        </button>
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                          Services
                        </span>
                      </div>

                      {/* Password Button */}
                      <div className="relative group">
                        <button
                          onClick={() => handlePasswordChange(staff)}
                          className="hover:text-red-500 transition-all ease-in-out duration-200 text-gray-800 px-3 py-1 rounded"
                        >
                          <RiLockPasswordFill />
                        </button>
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                          Password
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Staff</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Branch</label>
                <select
                  value={editFormData.branch}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      branch: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStaff}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h3 className="text-lg font-bold mb-4">Edit Services Access</h3>
            <div className="border rounded p-4">
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAllServices}
                    onChange={() => handleServiceChange("all")}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 font-medium">All Services</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                {services.map((service) => (
                  <label key={service._id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service._id)}
                      onChange={() => handleServiceChange(service._id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowServicesModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateServices}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update Services
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setSelectedStaff(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {successMessage && (
        <p className="text-green-500 mt-2">{successMessage}</p>
      )}
    </div>
  );
};

export default StaffList;
