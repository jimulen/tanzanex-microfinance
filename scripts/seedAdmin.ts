import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { connectDB } from "../lib/db";

async function seedAdmin() {
  await connectDB();

  const adminExists = await User.findOne({ role: "ADMIN" });
  if (adminExists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await User.create({
    name: "System Admin",
    email: "admin@microfinance.com",
    password: hashedPassword,
    role: "ADMIN",
    status: "ACTIVE",
  });

  console.log("✅ Admin created successfully");
  console.log("Email: admin@microfinance.com");
  console.log("Password: Admin@123");

  process.exit(0);
}

seedAdmin();
