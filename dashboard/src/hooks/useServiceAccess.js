import { useMemo } from "react";

export const useServiceAccess = () => {
  const userType = localStorage.getItem("userType");
  const userServices = JSON.parse(localStorage.getItem("userServices") || "[]");

  const hasAccess = useMemo(
    () => (path) => {
      // If admin, allow all access
      if (userType === "admin") return true;

      // For staff, check if they have access to the service
      return userServices.some((service) => path.startsWith(service.route));
    },
    [userType, userServices]
  );

  return {
    hasAccess,
    userServices,
    isAdmin: userType === "staff" ? false : true,
  };
};
