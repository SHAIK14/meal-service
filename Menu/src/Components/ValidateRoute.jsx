// src/components/ValidateRoute.jsx
import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { validateQRAccess } from "../utils/api";
import { useDining } from "../contexts/DiningContext";

const ValidateRoute = ({ children }) => {
  const { pincode, tableName } = useParams();
  const { setBranchDetails } = useDining();
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const result = await validateQRAccess(pincode, tableName);
        if (result.success) {
          setIsValid(true);
          setBranchDetails(result.branch);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to validate access");
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [pincode, tableName, setBranchDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">{error}</div>
      </div>
    );
  }

  return isValid ? children : <Navigate to="/" />;
};

export default ValidateRoute;
