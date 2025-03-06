const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const itemRoutes = require("./routes/admin/itemRoutes");
const categoryRoutes = require("./routes/admin/categoryRoutes");
const planRoutes = require("./routes/admin/planRoutes");
const userPlanRoutes = require("./routes/UserPlanRoutes");
const voucherRoutes = require("./routes/admin/voucherRoutes");
const userVoucherRoutes = require("./routes/userVoucherRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const adminSubscriptionRoutes = require("./routes/admin/adminSubscriptionRoutes");
const adminUserRoutes = require("./routes/admin/adminUserRoutes");
const menuRoutes = require("./routes/menuRoutes");
const configRoutes = require("./routes/admin/adminConfigRoutes");
const userconfigRoutes = require("./routes/userConfigRoutes");
const activeSubscriptionRoutes = require("./routes/activeSubscriptionRotues");
const DriverRegisterRoutes = require("./routes/admin/DriverRegisterRoute");
const driverAuthRoutes = require("./routes/driver/driverAuth");
const branchRoutes = require("./routes/admin/adminBranchRoutes");
const kitchenAuthRoutes = require("./routes/kitchen/authRoutes");
const kitchenOrderRoutes = require("./routes/kitchen/orderRoutes");
const diningRoutes = require("./routes/admin/diningRoutes");
const kitchenDiningRoutes = require("./routes/kitchen/diningRoutes");
const diningMenuRoutes = require("./routes/menu/diningMenuRoutes");
const diningCategoryRoutes = require("./routes/admin/diningCategoryRoutes");
const roleRoutes = require("./routes/admin/roleRoutes");
const serviceRoutes = require("./routes/admin/serviceRoutes");
const staffRoutes = require("./routes/admin/staffRoutes");
const cateringRoutes = require("./routes/admin/cateringRoutes");
const cateringMenuRoutes = require("./routes/catering/cateringMenuRoutes");
const kitchenCateringRoutes = require("./routes/kitchen/cateringRoutes");
const takeAwayRoutes = require("./routes/admin/takeAwayRoutes");
const TakeAwayOrderRoutes = require("./routes/takeAway/takeAwayOrder");
const kitchenTakeawayRoutes = require("./routes/kitchen/takeawayKitchenRoutes");
dotenv.config();
const app = express();
const server = http.createServer(app); // Create an HTTP server

// Configure CORS
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

connectDB().catch((err) =>
  console.error("Failed to connect to database:", err)
);

app.use(express.json());

// Add a logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Your existing routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/items", itemRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/plans", planRoutes);
app.use("/api/plans", userPlanRoutes);
app.use("/api/admin/vouchers", voucherRoutes);
app.use("/api/user/vouchers", userVoucherRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin/subscriptions", adminSubscriptionRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/admin/config", configRoutes);
app.use("/api/config", userconfigRoutes);
app.use("/api/subscriptions/user", activeSubscriptionRoutes);
app.use("/api/kitchen/auth", kitchenAuthRoutes);
app.use("/api/kitchen/orders", kitchenOrderRoutes);
app.use("/api/admin/drivers", DriverRegisterRoutes);
app.use("/api/driver/auth", driverAuthRoutes);
app.use("/api/admin/branches", branchRoutes);
app.use("/api/admin/dining", diningRoutes);
app.use("/api/kitchen/dining", kitchenDiningRoutes);
app.use("/api/dining-menu", diningMenuRoutes);
app.use("/api/admin/dining-categories", diningCategoryRoutes);
app.use("/api/admin/roles", roleRoutes);
app.use("/api/admin/services", serviceRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/admin/catering", cateringRoutes);
app.use("/api/catering-menu", cateringMenuRoutes);
app.use("/api/kitchen/catering", kitchenCateringRoutes);
app.use("/api/admin/takeaway", takeAwayRoutes);
app.use("/api/takeaway/order", TakeAwayOrderRoutes);
app.use("/api/kitchen/takeaway", kitchenTakeawayRoutes);
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`API available at http://${HOST}:${PORT}/api`);
});

server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
