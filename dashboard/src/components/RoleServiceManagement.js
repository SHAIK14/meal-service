// components/RoleServiceManagement.js
import React, { useState, useEffect } from "react";
import {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
  createService,
  getAllServices,
  updateService,
} from "../utils/api2";

const RoleServiceManagement = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState([]);
  const [services, setServices] = useState([]);
  const [newRole, setNewRole] = useState({ name: "" });
  const [newService, setNewService] = useState({ name: "", route: "" });
  const [editingRole, setEditingRole] = useState(null);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchServices();
  }, []);

  const fetchRoles = async () => {
    const response = await getAllRoles();
    if (response.success) {
      setRoles(response.data);
    }
  };

  const fetchServices = async () => {
    const response = await getAllServices();
    if (response.success) {
      setServices(response.data);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (editingRole) {
      const response = await updateRole(editingRole._id, newRole);
      if (response.success) {
        setEditingRole(null);
      }
    } else {
      await createRole(newRole);
    }
    setNewRole({ name: "" });
    fetchRoles();
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (editingService) {
      const response = await updateService(editingService._id, newService);
      if (response.success) {
        setEditingService(null);
      }
    } else {
      await createService(newService);
    }
    setNewService({ name: "", route: "" });
    fetchServices();
  };

  const handleDeleteRole = async (roleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this role?"
    );
    if (confirmed) {
      await deleteRole(roleId);
      fetchRoles();
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setNewRole({ name: role.name });
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({ name: service.name, route: service.route });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "roles" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "services"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("services")}
          >
            Services
          </button>
        </div>
      </div>

      {activeTab === "roles" ? (
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? "Edit Role" : "Create Role"}
            </h2>
            <form onSubmit={handleRoleSubmit} className="mb-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Role Name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ name: e.target.value })}
                  className="p-2 border rounded w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingRole ? "Update Role" : "Create Role"}
              </button>
            </form>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Existing Roles</h2>
            <div className="grid gap-4">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="border p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold">{role.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? "Edit Service" : "Create Service"}
            </h2>
            <form onSubmit={handleServiceSubmit} className="mb-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Service Name (e.g., Branch Management)"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  className="p-2 border rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Route (e.g., /branches)"
                  value={newService.route}
                  onChange={(e) =>
                    setNewService({ ...newService, route: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingService ? "Update Service" : "Create Service"}
              </button>
            </form>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Existing Services</h2>
            <div className="grid gap-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="border p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <div className="text-sm text-gray-600">
                      Route: {service.route}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditService(service)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleServiceManagement;
