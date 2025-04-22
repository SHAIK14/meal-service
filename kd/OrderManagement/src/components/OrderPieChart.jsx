// src/components/OrderPieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import "../styles/Dashboard.css"; // Import the CSS file

// Register required elements
Chart.register(ArcElement, Tooltip, Legend);

function OrderPieChart({ totalOrders, deliveredOrders }) {
  const remainingOrders = totalOrders - deliveredOrders;

  const data = {
    labels: ["Delivered Orders", "Pending Orders"],
    datasets: [
      {
        data: [deliveredOrders, remainingOrders],
        backgroundColor: ["#4caf50", "#ff5722"],
        hoverBackgroundColor: ["#66bb6a", "#ff7043"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="pie-chart-container">
      <Pie data={data} options={options} />
    </div>
  );
}

export default OrderPieChart;
