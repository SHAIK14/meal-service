import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { getKitchenOrders } from "../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
// import "../styles/CurrentOrder.css";

const KitchenOrders = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [expandedTime, setExpandedTime] = useState(null);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holiday, setHoliday] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setHoliday(null);
      const response = await getKitchenOrders(selectedDate.toDate());

      if (response.data?.success) {
        if (response.data.isHoliday) {
          setHoliday(response.data.message);
          setOrders({});
        } else {
          setOrders(response.data.data);
        }
      } else {
        setError(response.data?.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Failed to fetch orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTimeSlotClick = (timeSlot) => {
    setExpandedTime(expandedTime === timeSlot ? null : timeSlot);
  };

  const handlePrintKot = (timeSlot, timeSlotData) => {
    navigate("/kot", {
      state: {
        date: selectedDate.format("YYYY-MM-DD"),
        fromTime: timeSlotData.deliveryTime.split("-")[0].trim(),
        toTime: timeSlotData.deliveryTime.split("-")[1].trim(),
      },
    });
  };

  return (
    <div className="bg-red-500">
      <div className="dashboard-header">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
      </div>

      {loading && (
        <div className="loading-container">
          <CircularProgress />
        </div>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {holiday && <Alert severity="info">No orders today - {holiday}</Alert>}

      {!holiday && Object.entries(orders).length === 0 && !loading && (
        <Alert severity="info">No orders found for this date</Alert>
      )}

      <div className="time-slots-container">
        {Object.entries(orders).map(([kitchenTime, timeSlotData]) => (
          <div key={kitchenTime} className="time-slot-card">
            <div
              className="time-slot-header"
              onClick={() => handleTimeSlotClick(kitchenTime)}
            >
              <div className="time-info">
                <span className="kitchen-time">{kitchenTime}</span>
                <span className="delivery-time">
                  Delivery: {timeSlotData.deliveryTime}
                </span>
              </div>
              <span
                className={`arrow ${
                  expandedTime === kitchenTime ? "expanded" : ""
                }`}
              />
            </div>

            {expandedTime === kitchenTime && (
              <div className="time-slot-content">
                <div className="items-container">
                  <h4>Items to Prepare:</h4>
                  <div className="items-list">
                    {timeSlotData.items.map((item) => (
                      <div key={item.name} className="item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {!holiday && (
                  <button
                    className="print-kot-button"
                    onClick={() => handlePrintKot(kitchenTime, timeSlotData)}
                  >
                    Print KOT
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenOrders;
