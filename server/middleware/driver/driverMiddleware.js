const jwt = require("jsonwebtoken");
const Driver = require("../../models/admin/DriverRegister");

const driverAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_DRIVER);
    const driver = await Driver.findOne({
      driverId: decoded.driverId,
      status: "approved",
    });

    if (!driver) {
      throw new Error();
    }

    req.driver = driver;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = driverAuth;
