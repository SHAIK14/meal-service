// src/Components/ValidateRoute.jsx - Update component
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { validateQRAccess } from "../utils/api";
import { useDining } from "../contexts/DiningContext";
import BookingModal from "./BookingModal";

const ValidateRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const { pincode, tableName } = useParams();
  const {
    setBranchDetails,
    showBookingModal,
    sessionDetails,
    handleSessionStarted,
  } = useDining();

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
          setValidationCompleted(true);
        }
      }
    };

    validateAccess();

    return () => {
      isMounted = false;
    };
  }, [pincode, tableName, validationCompleted]);

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

  return (
    <>
      {/* Show booking modal if needed */}
      {showBookingModal && !sessionDetails && (
        <BookingModal
          isOpen={true}
          pincode={pincode}
          tableName={tableName}
          onSessionStarted={handleSessionStarted}
        />
      )}

      {/* Only show menu when session exists */}
      {!showBookingModal || sessionDetails ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">
            Please complete the booking to access the menu
          </p>
        </div>
      )}
    </>
  );
};

export default ValidateRoute;
