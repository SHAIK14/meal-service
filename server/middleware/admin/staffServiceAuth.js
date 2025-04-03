const jwt = require("jsonwebtoken");
const Staff = require("../../models/admin/Staff");
const Service = require("../../models/admin/Service");
const staffServiceAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    // If admin, allow all access
    if (decoded.type === "admin") {
      return next();
    }

    // For staff, check service access
    if (decoded.type === "staff") {
      const staff = await Staff.findById(decoded.id).populate("services");

      if (!staff) {
        throw new Error("Staff not found");
      }

      const fullPath = req.originalUrl || req.url;
      let requestedPath = fullPath.replace("/api/admin", "");

      // Route mappings
      const routeMappings = {
        "/config": "/configuration",
        "/dining": "/dining-config",
      };

      // Extract the base route
      const baseRoute = "/" + requestedPath.split("/")[1];
      const mappedRoute = routeMappings[baseRoute] || baseRoute;

      console.log("Full Path:", fullPath);
      console.log("Base Route:", baseRoute);
      console.log("Mapped Route:", mappedRoute);
      console.log("Staff Services:", staff.services);

      // Check if staff has access to the mapped route
      const hasAccess = staff.services.some(
        (service) =>
          service.route === mappedRoute || mappedRoute.startsWith(service.route)
      );

      console.log("Has Access:", hasAccess);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this service",
        });
      }

      req.staff = staff;
      req.userType = "staff";
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
module.exports = staffServiceAuth;
