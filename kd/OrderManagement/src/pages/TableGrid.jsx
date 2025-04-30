// src/components/dining/TableGrid.jsx
import React from "react";
import { FaUtensils } from "react-icons/fa";

function TableGrid({ tables, notifications, onTableClick }) {
  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-4 place-items-center lg:grid-cols-6 xl:grid-cols-8 gap-6">
      {tables.map((table) => (
        <div
          key={table.id}
          onClick={() => onTableClick(table)}
          className={`
            flex flex-col items-center justify-center gap-4 w-40 h-40 
            border-2 rounded-2xl p-4 cursor-pointer transition-colors duration-300
            ${
              table.status === "available"
                ? "bg-green-100 border-green-300"
                : "bg-red-100 border-red-300"
            }
          `}
        >
          <FaUtensils
            className={`text-4xl ${
              table.status === "available" ? "text-green-600" : "text-red-600"
            }`}
          />
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-2xl font-bold">{table.name}</h3>
            <span
              className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${
                table.status === "available" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </span>
            {notifications[table.name] > 0 && (
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center mt-1">
                {notifications[table.name]}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TableGrid;
