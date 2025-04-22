import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { getKotByTime } from "../utils/api";
import "../styles/kot.css";

const Kot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kotData, setKotData] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchKotData = async () => {
      try {
        const { date, fromTime, toTime } = location.state || {};

        if (!date || !fromTime || !toTime) {
          throw new Error("Missing required parameters");
        }

        const response = await getKotByTime(date, fromTime, toTime);
        console.log("KOT API Response:", response);

        if (response.success && response.data.data) {
          setKotData(response.data.data);
        } else {
          throw new Error(response.error || "Failed to fetch KOT data");
        }
      } catch (err) {
        console.error("KOT fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKotData();
  }, [location]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        console.log("Preparing print content...");
        setTimeout(() => {
          resolve();
        }, 200);
      });
    },
    onAfterPrint: () => {
      console.log("Printing completed");
    },
    removeAfterPrint: false,
  });

  if (loading) {
    return (
      <div className="kot-loading">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kot-error">
        <div>{error}</div>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!kotData || !kotData.kots) {
    return (
      <div className="kot-error">
        <div>No KOT data available</div>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="kot-container">
      <div className="kot-actions">
        <button onClick={() => navigate(-1)}>Back</button>
        <button onClick={handlePrint}>Print All KOTs</button>
      </div>

      <div className="kot-content" ref={componentRef}>
        {kotData.kots.map((kot, index) => (
          <div key={index} className="kot-page">
            <div className="kot-header">
              <h2>{kotData.branch.name}</h2>
              <p>{kotData.branch.address.main}</p>
              <p>
                {kotData.branch.address.city}, {kotData.branch.address.state}{" "}
                {kotData.branch.address.pincode}
              </p>
            </div>

            <div className="kot-details">
              <p className="kot-date">
                Date: {new Date(kotData.date).toLocaleDateString()}
              </p>
              <p className="kot-time">Delivery Time: {kotData.deliveryTime}</p>
            </div>

            <div className="kot-customer">
              <p>
                <strong>Customer:</strong> {kot.customerName}
              </p>
              <p>
                <strong>Phone:</strong> {kot.phoneNumber}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {`${kot.deliveryAddress.street}, ${kot.deliveryAddress.area}`}
              </p>
            </div>

            <div className="kot-items">
              <h3>Items:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Package</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {kot.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.packageType}</td>
                      <td>x{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="kot-footer">
              <p>
                Page {index + 1} of {kotData.kots.length}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kot;
