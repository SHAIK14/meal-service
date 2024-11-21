const jwt = require("jsonwebtoken");
const KitchenUser = require("../../models/kitchen/kitchenAuth");

const kitchenAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KITCHEN);
    const kitchen = await KitchenUser.findOne({ _id: decoded.id });

    if (!kitchen || !kitchen.isActive) {
      throw new Error();
    }

    req.kitchen = kitchen;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = kitchenAuth;
