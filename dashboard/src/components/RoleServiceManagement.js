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
import { FaUserEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

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
    <div className="p-6 bg-white w-full h-screen overflow-auto">
      <div className="mb-6 ">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-6 py-2  ${
              activeTab === "roles" ? "bg-gray-800 text-white" : "text-gray-800"
            }`}
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </button>
          <button
            className={`px-6 py-2  ${
              activeTab === "services"
                ? "bg-gray-800 text-white"
                : " text-gray-800"
            }`}
            onClick={() => setActiveTab("services")}
          >
            Services
          </button>
        </div>
      </div>

      {activeTab === "roles" ? (
        <div>
          <div className="bg-gray-100 text-gray-800  flex flex-col  justify-center   p-6 ">
            <h2 className="text-xl font-semibold mb-4">
              {editingRole ? "Edit Role" : "Create Role"}
            </h2>
            <form onSubmit={handleRoleSubmit} className="">
              <div className="flex items-center justify-center w-full gap-4 ">
                <div className="relative  flex-1 flex  group ">
                  <input
                    type="text"
                    placeholder=""
                    value={newRole.name}
                    onChange={(e) => setNewRole({ name: e.target.value })}
                    className="w-full  px-4 py-3 bg-transparent border-2 border-gray-400  outline-none transition-all duration-300 ease-in-out focus:border-gray-400 focus:ring-1 text-black focus:ring-gray-400 peer  placeholder-transparent"
                    id="roleName"
                  />
                  <label
                    htmlFor="roleName"
                    className="absolute left-4 top-3 text-gray-800 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-800 pointer-events-none origin-left bg-gray-100 px-1"
                  >
                    Role Name
                  </label>
                </div>
                <div className="">
                  <button
                    type="submit"
                    className="bg-gray-300 outline-none border-2 transition-all font-semibold ease-in hover:bg-gray-800 text-gray-800 hover:text-white  px-6 py-3  "
                  >
                    {editingRole ? "Update Role" : "Create Role"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-gray-100 text-gray-800 overflow-auto max-h-[350px] p-6  ">
            <div className="bg-gray-100 p-1 items-center">
              <h2 className="text-xl font-semibold ">Existing Roles</h2>
            </div>
            <div className="grid gap-4">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="border-b p-2 border-gray-300 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-regular">{role.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    {/* Edit Button */}
                    <div className="relative group">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="hover:text-green-500 transition-all ease-in-out duration-200 text-gray-800 px-3 py-1 rounded"
                      >
                        <FaUserEdit />
                      </button>
                      {/* Tooltip for Edit */}
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                        Edit
                      </span>
                    </div>

                    {/* Delete Button */}
                    <div className="relative group">
                      <button
                        onClick={() => handleDeleteRole(role._id)}
                        className="hover:text-red-500 transition-all ease-in-out duration-200 text-gray-800 px-3 py-1 rounded"
                      >
                        <MdDelete />
                      </button>
                      {/* Tooltip for Delete */}
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                        Delete
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gray-100 text-gray-800 font-semibold p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {editingService ? "Edit Service" : "Create Service"}
            </h2>
            <form onSubmit={handleServiceSubmit} className="">
              <div className="mb-4">
                <div className="relative mb-4 ">
                  <input
                    type="text"
                    placeholder="Service Name (e.g., Branch Management)"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    className="w-full  px-4 py-3 bg-transparent border-2 border-gray-400  outline-none transition-all duration-300 ease-in-out focus:border-gray-400 focus:ring-2 text-gray-800 focus:ring-gray-100 peer  placeholder-transparent"
                  />
                  <lable className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-800 pointer-events-none origin-left bg-gray-100 px-1">
                    Service Name
                  </lable>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Route (e.g., /branches)"
                    value={newService.route}
                    onChange={(e) =>
                      setNewService({ ...newService, route: e.target.value })
                    }
                    className="w-full  px-4 py-3 bg-transparent border-2 border-gray-400  outline-none transition-all duration-300 ease-in-out focus:border-gray-400 focus:ring-2 text-black focus:ring-gray-100 peer  placeholder-transparent"
                  />
                  <lable className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform -translate-y-6 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:opacity-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gray-500 pointer-events-none origin-left bg-gray-100 px-1">
                    Route - Ex: /branches
                  </lable>
                </div>
              </div>
              <div className="w-full flex items-end justify-end">
                <button
                  type="submit"
                  className=" bg-gray-300  transition-all ease-in hover:bg-gray-800 hover:text-white text-gray-800  px-6 py-3  "
                >
                  {editingService ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-gray-100 text-gray-800 p-6 rounded-lg  max-h-[350px] overflow-auto ">
            <h2 className="text-xl font-semibold mb-4">Existing Services</h2>
            <div className="grid gap-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="p-2 border-b border-gray-400 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <div className="text-sm text-gray-600">
                      Route: {service.route}
                    </div>
                  </div>
                  <div className="relative group">
                    <button
                      onClick={() => handleEditService(service)}
                      className="hover:text-green-500 transition-all ease-in-out duration-200 text-gray-800 px-3 py-1 rounded"
                    >
                      <FaUserEdit />
                      {/* Tooltip for Edit */}
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1">
                        Edit
                      </span>
                    </button>
                  </div>
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
