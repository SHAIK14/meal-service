require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../../models/admin/Admin");
const connectDB = require("../../config/database");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error("Admin credentials not found in environment variables");
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log("Admin account already exists");
    } else {
      const newAdmin = new Admin({
        username: adminUsername,
        password: adminPassword,
      });

      await newAdmin.save();
      console.log("Admin account created successfully");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding admin account:", error);
    process.exit(1);
  }
};

seedAdmin();
