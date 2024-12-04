// components/Branch.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/Branch.css";
import { getAllBranches, deleteBranch } from "../utils/api2";

const Branch = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);

  const fetchBranches = async () => {
    const response = await getAllBranches();
    if (response.success) {
      setBranches(response.data);
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

  return (
    <div className="branch-container">
      <div className="branch-header">
        <h2>Branch Management</h2>
        <button
          className="add-branch-btn"
          onClick={() => navigate("/branches/add")} // Add this onClick handler
        >
          <FaPlus /> Add New Branch
        </button>
      </div>

      <div className="branch-grid">
        {branches.map((branch) => (
          <div key={branch._id} className="branch-card">
            <h3>{branch.name}</h3>
            <div className="branch-details">
              <div className="branch-detail-item">
                <span>CR Number:</span>
                <span>{branch.crNumber}</span>
              </div>
              <div className="branch-detail-item">
                <span>Municipality Number:</span>
                <span>{branch.municipalityNumber}</span>
              </div>
              <div className="branch-detail-item">
                <span>VAT Number:</span>
                <span>{branch.vatNumber}</span>
              </div>
              <div className="branch-detail-item">
                <span>Service Radius:</span>
                <span>{branch.serviceRadius} km</span>
              </div>
            </div>
            <div className="branch-actions">
              <button
                className="edit-btn"
                onClick={() => navigate(`/branches/edit/${branch._id}`)}
              >
                <FaEdit /> Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(branch._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Branch;
