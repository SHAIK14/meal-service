// In ValidateRoute.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { validateQRAccess } from "../utils/api";
import { useDining } from "../contexts/DiningContext";
import BookingModal from "./BookingModal";
import SessionAuthModal from "./SessionAuthModal";

const ValidateRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [needsAuthentication, setNeedsAuthentication] = useState(false);
  const [sessionToAuth, setSessionToAuth] = useState(null);
  const { pincode, tableName } = useParams();
  const {
    setBranchDetails,
    showBookingModal,
    setShowBookingModal,
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
        console.log("Full validation response:", response); // Debug log

        if (!isMounted) return;

        if (response.success) {
          console.log(
            "QR validation successful. Branch ID:",
            response.branch?.id
          );
          setBranchDetails(response);
          setIsValid(true);

          // Check if we need to authenticate for an existing session
          if (response.sessionExists && response.requiresAuthentication) {
            console.log(
              "Session requires authentication:",
              response.session.id
            );

            // Check if we already have authentication in localStorage
            const savedAuth = localStorage.getItem(
              `session_${response.session.id}`
            );
            console.log("Saved auth from localStorage:", savedAuth);

            if (savedAuth) {
              try {
                const auth = JSON.parse(savedAuth);
                if (auth.authenticated) {
                  // We're already authenticated for this session on this device
                  console.log("Using stored authentication for session");
                  // Continue as normal
                } else {
                  // Need to authenticate
                  setSessionToAuth(response.session);
                  setNeedsAuthentication(true);
                  // Prevent showing the booking modal
                  setShowBookingModal(false);
                }
              } catch (e) {
                console.error("Error parsing saved auth:", e);
                setSessionToAuth(response.session);
                setNeedsAuthentication(true);
                setShowBookingModal(false);
              }
            } else {
              // Need to authenticate
              setSessionToAuth(response.session);
              setNeedsAuthentication(true);
              // Prevent showing the booking modal
              setShowBookingModal(false);
            }
          } else if (!response.sessionExists) {
            // No existing session, show booking modal
            setShowBookingModal(true);
          }
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

  // Handle successful authentication
  // In ValidateRoute.jsx - update the handleAuthSuccess function
  const handleAuthSuccess = (session) => {
    console.log("Authentication successful:", session);

    // Make sure the PIN is saved in localStorage
    if (session.pin) {
      try {
        localStorage.setItem(
          `session_${session.id}`,
          JSON.stringify({
            authenticated: true,
            pin: session.pin,
          })
        );
        console.log("Saved session PIN to localStorage:", session.pin);
      } catch (e) {
        console.error("Error saving PIN to localStorage:", e);
      }
    }

    setNeedsAuthentication(false);
    handleSessionStarted(session);
  };

  // Cancel authentication attempt - don't allow this to bypass authentication
  const handleAuthCancel = () => {
    console.log("Authentication cancelled - redirecting");
    // Instead of showing booking form, redirect away
    setIsValid(false);
  };

  // Debug log to see current state
  useEffect(() => {
    console.log("Current session details:", sessionDetails);
    console.log("Needs authentication:", needsAuthentication);
    console.log("Show booking modal:", showBookingModal);
  }, [sessionDetails, needsAuthentication, showBookingModal]);

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
      {/* Authentication modal for existing sessions */}
      {needsAuthentication && sessionToAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <SessionAuthModal
            isOpen={true}
            sessionId={sessionToAuth.id}
            onClose={handleAuthCancel}
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      )}

      {/* Booking modal for new sessions */}
      {showBookingModal && !sessionDetails && !needsAuthentication && (
        <BookingModal
          isOpen={true}
          pincode={pincode}
          tableName={tableName}
          onSessionStarted={handleSessionStarted}
        />
      )}

      {/* Only show menu when properly authenticated */}
      {sessionDetails ? (
        children
      ) : (
        <>
          {/* This content is hidden behind the modals */}
          <div className="min-h-screen flex items-center justify-center bg-gray-50 opacity-30 pointer-events-none">
            <p className="text-gray-500">
              Please authenticate to access the menu
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default ValidateRoute;
