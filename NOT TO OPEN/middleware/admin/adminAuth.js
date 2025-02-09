const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    const admin = await Admin.findOne({ _id: decoded.id });

    if (!admin) {
      throw new Error();
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = adminAuth;
