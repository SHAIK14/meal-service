const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin/Admin");
const Staff = require("../../models/admin/Staff");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    if (decoded.type === "admin") {
      const admin = await Admin.findOne({ _id: decoded.id });
      if (!admin) {
        throw new Error();
      }
      req.admin = admin;
      req.userType = "admin";
    } else if (decoded.type === "staff") {
      const staff = await Staff.findById(decoded.id);
      if (!staff) {
        throw new Error();
      }
      req.staff = staff;
      req.userType = "staff";
    } else {
      throw new Error();
    }

    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = adminAuth;
