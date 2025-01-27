import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { validateQRAccess } from "../utils/api";
import { useDining } from "../contexts/DiningContext";

const ValidateRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const { pincode, tableName } = useParams();
  const { setBranchDetails } = useDining();

  useEffect(() => {
    let isMounted = true;

    const validateAccess = async () => {
      if (!pincode || !tableName) return;

      try {
        const response = await validateQRAccess(pincode, tableName);
        if (isMounted && response.success) {
          setBranchDetails(response);
          setIsValid(true);
        }
      } catch (error) {
        console.error("Validation error:", error);
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateAccess();
    return () => {
      isMounted = false;
    };
  }, [pincode, tableName]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Validating access...</div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ValidateRoute;
