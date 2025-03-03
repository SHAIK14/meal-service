import React, { useState, useEffect } from "react";
import {
  createStaff,
  getAllBranches,
  getAllRoles,
  getAllServices,
} from "../utils/api2.js";

const StaffManagement = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    branch: "",
    role: "",
    services: [],
  });

  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectAllServices, setSelectAllServices] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchRes, roleRes, servicesRes] = await Promise.all([
        getAllBranches(),
        getAllRoles(),
        getAllServices(),
      ]);

      if (branchRes.success) setBranches(branchRes.data);
      if (roleRes.success) setRoles(roleRes.data);
      if (servicesRes.success) setServices(servicesRes.data);
    } catch (error) {
      setError("Error fetching data");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (serviceId) => {
    if (serviceId === "all") {
      const allServiceIds = selectAllServices
        ? []
        : services.map((service) => service._id);
      setSelectAllServices(!selectAllServices);
      setFormData((prev) => ({
        ...prev,
        services: allServiceIds,
      }));
    } else {
      setFormData((prev) => {
        const updatedServices = prev.services.includes(serviceId)
          ? prev.services.filter((id) => id !== serviceId)
          : [...prev.services, serviceId];

        setSelectAllServices(updatedServices.length === services.length);
        return {
          ...prev,
          services: updatedServices,
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const result = await createStaff(formData);
      if (result.success) {
        setSuccessMessage("Staff created successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          username: "",
          password: "",
          branch: "",
          role: "",
          services: [],
        });
        setSelectAllServices(false);
      } else {
        setError(result.error || "Failed to create staff");
      }
    } catch (error) {
      setError("An error occurred while creating staff");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Create Staff</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
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
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
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

          {/* Services Section */}
          <div className="mt-6">
            <label className="block mb-2 font-medium">Services Access</label>
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
              <div className="grid grid-cols-3 gap-4">
                {services.map((service) => (
                  <label key={service._id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service._id)}
                      onChange={() => handleServiceChange(service._id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Staff"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {successMessage && (
          <p className="text-green-500 mt-2">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
