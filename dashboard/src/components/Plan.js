import React, { useState, useEffect } from "react"; // Import React and hooks
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import { FaPlus } from "react-icons/fa"; // Import the plus icon

const Plans = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages
  const [plans, setPlans] = useState([]); // State to hold plan data

  useEffect(() => {
    // Simulate fetching plans from an API
    const fetchPlans = async () => {
      try {
        // Replace this with your actual data fetching logic
        // Example: const response = await fetch('/api/plans');
        // const data = await response.json();
        const data = []; // Simulated empty data for demonstration
        setPlans(data);
      } catch (err) {
        setError("Failed to load plans."); // Set error message if fetching fails
      } finally {
        setLoading(false); // Update loading state
      }
    };

    fetchPlans(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs once on mount

  const handleNewPlan = () => {
    navigate("/plans/new"); // Redirect to the New Plan page
  };

  return (
    <div
      style={{
        padding: "50px",
        backgroundColor: "#F4F4F4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {loading ? (
        <h2>Loading...</h2> // Display loading message
      ) : error ? (
        <h2>{error}</h2> // Display error message if there's an error
      ) : plans.length === 0 ? (
        <>
          <h1>No Plans Found</h1>
          <p>Create a new plan by clicking the button below.</p>
          <button
            onClick={handleNewPlan}
            style={buttonStyle}
            aria-label="Create a new plan"
          >
            <FaPlus style={{ marginRight: "8px" }} /> New Plan
          </button>
        </>
      ) : (
        <div>
          <h1>Your Plans</h1>
          {/* Render the list of plans here */}
          <ul>
            {plans.map((plan) => (
              <li key={plan.id}>{plan.name}</li> // Adjust according to your data structure
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Inline style for the button
const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
  backgroundColor: "#4CAF50", // Green background
  color: "white", // White text
  border: "none", // No border
  borderRadius: "5px", // Rounded corners
  transition: "background-color 0.3s",
};

// Optional: Add hover effect with CSS
buttonStyle[":hover"] = {
  backgroundColor: "#45a049", // Darker green on hover
};

export default Plans; // Export the Plans component
