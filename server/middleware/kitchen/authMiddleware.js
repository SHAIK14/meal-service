// middleware/kitchen/authMiddleware.js
const jwt = require("jsonwebtoken");
const Branch = require("../../models/admin/Branch");

const kitchenAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KITCHEN);
    const branch = await Branch.findOne({
      _id: decoded.id,
      "address.pincode": decoded.pincode,
    });

    if (!branch) {
      throw new Error();
    }

    req.branch = branch;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = kitchenAuth;
