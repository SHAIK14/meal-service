// components/ProtectedRoute.js
import React from "react";

const ProtectedRoute = ({ element: Component, path }) => {
  const userType = localStorage.getItem("userType");
  const userServices = JSON.parse(localStorage.getItem("userServices") || "[]");

  console.log("User Type:", userType);
  console.log("User Services:", userServices);
  console.log("Current Path:", path);

  // Admin has access to everything
  if (userType === "admin") {
    return Component;
  }

  // For staff, check if they have access to this route
  const hasAccess = userServices.some((service) =>
    path.startsWith(service.route)
  );

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Access Denied</h2>
          <p>You don't have permission to access this feature.</p>
          <div className="mt-4">
            <h3 className="font-semibold">Your Available Services:</h3>
            <ul className="list-disc pl-5 mt-2">
              {userServices.map((service, index) => (
                <li key={index}>
                  {service.name} ({service.route})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return Component;
};
export default ProtectedRoute;
