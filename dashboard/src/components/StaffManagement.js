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
    <div className="p-6 bg-white  h-screen overflow-auto">
      <div className="bg-gray-100 text-gray-800  shadow-sm p-6 mb-6 ">
        <h2 className="text-xl font-regular mb-4">Create Staff</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4">
            {/* Name Field */}
            <div className="relative mb-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-lg outline-none transition-all duration-300 ease-in-out focus:border-gray-500 focus:ring-2 text-gray-800 focus:ring-gray-200 peer placeholder-transparent"
              />
              <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-100 px-1">
                Name
              </label>
            </div>

            {/* Email Field */}
            <div className="relative mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-lg outline-none transition-all duration-300 ease-in-out focus:border-gray-500 focus:ring-2 text-gray-800 focus:ring-gray-200 peer placeholder-transparent"
                required
              />
              <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-100 px-1">
                Email
              </label>
            </div>

            {/* Phone Field */}
            <div className="relative mb-4">
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-lg outline-none transition-all duration-300 ease-in-out focus:border-gray-500 focus:ring-2 text-gray-800 focus:ring-gray-200 peer placeholder-transparent"
                required
              />
              <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-100 px-1">
                Phone
              </label>
            </div>

            {/* Username Field */}
            <div className="relative mb-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-lg outline-none transition-all duration-300 ease-in-out focus:border-gray-500 focus:ring-2 text-gray-800 focus:ring-gray-200 peer placeholder-transparent"
                required
              />
              <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-200 px-1">
                Username
              </label>
            </div>

            {/* Password Field */}
            <div className="relative mb-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-lg outline-none transition-all duration-300 ease-in-out focus:border-gray-500 focus:ring-2 text-gray-800 focus:ring-gray-200 peer placeholder-transparent"
                required
              />
              <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-900 px-1">
                Password
              </label>
            </div>
            {/* Branch Select Field */}
            <div className="relative mb-4">
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-lg outline-none transition-all duration-300 ease-in-out focus:border-gray-500 focus:ring-2 text-gray-800 focus:ring-gray-200 peer appearance-none"
                required
              >
                <option value="" hidden>
                  Select Branch
                </option>
                {branches.map((branch) => (
                  <option
                    key={branch._id}
                    value={branch._id}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-100"
                  >
                    {branch.name}
                  </option>
                ))}
              </select>
              <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-200 px-1">
                Branch
              </label>
            </div>

            {/* Role Select Field */}
            <div className="relative mb-4">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-lg outline-none transition-all duration-300 ease-in-out focus:border-gray-500 focus:ring-2 text-gray-800 focus:ring-gray-200 peer appearance-none"
                required
              >
                <option value="" hidden>
                  Select Role
                </option>
                {roles.map((role) => (
                  <option
                    key={role._id}
                    value={role._id}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-100"
                  >
                    {role.name}
                  </option>
                ))}
              </select>
              <label className="absolute left-4 top-3 text-gray-800 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-200 px-1">
                Role
              </label>
            </div>
          </div>

          {/* Services Section */}
          <div className="mt-6">
            <label className="block mb-2 font-regular">Services Access</label>
            <div className=" rounded p-4">
              <div className="mb-4 ">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAllServices}
                    onChange={() => handleServiceChange("all")}
                    className="form-checkbox h-5 w-5 text-gray-600"
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
                      className="form-checkbox h-5 w-5 text-gray-600"
                    />
                    <span className="ml-2">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 bg-gray-300 border  transition-all ease-in-out duration-200    text-gray-800 px-6 py-3 font-semibold   hover:bg-gray-800 hover:text-white"
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
