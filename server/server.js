const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const itemRoutes = require("./routes/admin/itemRoutes");
dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

connectDB().catch((err) =>
  console.error("Failed to connect to database:", err)
);

app.use(express.json());

// Add a logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/items", itemRoutes);

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
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
