// src/pages/Dashboard.js
import React, { useState } from "react";
import OrderPieChart from "../components/OrderPieChart";
import OrderBarChart from "../components/OrderBarChart";
import TopNav from "../components/TopNav";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [totalOrders] = useState(250);
  const [deliveredOrders] = useState(180);
  const [timeRange, setTimeRange] = useState("Last Month");

  // Function to generate data based on selected time range
  const generateBarChartData = () => {
    let labels = [];
    let data = [];

    if (timeRange === "Last Week") {
      labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
      data = [10, 15, 20, 25, 18, 30, 22]; // Example data for each day
    } else if (timeRange === "Last Month") {
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      data = [40, 60, 50, 30]; // Example data for each week
    } else if (timeRange === "Since Last Year") {
      labels = ["Q1", "Q2", "Q3", "Q4"];
      data = [150, 200, 250, 180]; // Example data for each quarter
    }

    return {
      labels,
      datasets: [
        {
          label: "Delivered Orders",
          data: data,
          backgroundColor: "#4caf50",
        },
      ],
    };
  };

  return (
    <div className="dashboard-container">
      <TopNav />
      <div className="pie-chart-section">
        <h2>Today's Orders</h2>
        <div className="pie-chart-container">
          <OrderPieChart
            totalOrders={totalOrders}
            deliveredOrders={deliveredOrders}
          />
        </div>

        <button
          className="orders-today-button"
          onClick={() => navigate("/orders")}
        >
          Pending Orders: {totalOrders - deliveredOrders}
        </button>
      </div>

      <div className="bar-chart-section">
        <h2>Orders Delivered Over Time</h2>

        <div className="bar-chart-container">
          <OrderBarChart data={generateBarChartData()} />
        </div>
        <div className="time-range-select">
          <label htmlFor="time-range">Select Time Range:</label>
          <select
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="Last Week">Last Week</option>
            <option value="Last Month">Last Month</option>
            <option value="Since Last Year">Since Last Year</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
