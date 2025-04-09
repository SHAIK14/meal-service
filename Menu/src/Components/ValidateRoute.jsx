// src/Components/ValidateRoute.jsx - FIXED VERSION
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { validateQRAccess } from "../utils/api";
import { useDining } from "../contexts/DiningContext";

const ValidateRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false); // Add this state
  const { pincode, tableName } = useParams();
  const { setBranchDetails } = useDining();

  useEffect(() => {
    // Skip if validation already completed or required params are missing
    if (validationCompleted || !pincode || !tableName) {
      return;
    }

    let isMounted = true;

    const validateAccess = async () => {
      try {
        console.log(`Validating QR access once for: ${pincode}/${tableName}`);
        const response = await validateQRAccess(pincode, tableName);

        if (!isMounted) return;

        if (response.success) {
          console.log(
            "QR validation successful. Branch ID:",
            response.branch?.id
          );
          setBranchDetails(response);
          setIsValid(true);
        } else {
          console.error("QR validation failed:", response.message);
        }
      } catch (error) {
        console.error("Validation error:", error);
      } finally {
        if (isMounted) {
          setIsValidating(false);
          setValidationCompleted(true); // Mark validation as completed
        }
      }
    };

    validateAccess();

    return () => {
      isMounted = false;
    };
  }, [pincode, tableName, validationCompleted]); // Add validationCompleted to dependencies

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Validating access...</div>
      </div>
    );
  }

  if (!isValid) {
    console.log("Access validation failed, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("Access validation successful, rendering children");
  return children;
};

export default ValidateRoute;
