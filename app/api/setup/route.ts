import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const adminExists = await User.findOne({ role: "ADMIN" });
  if (adminExists) {
    return NextResponse.json({
      message: "Admin already exists",
    });
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await User.create({
    name: "System Admin",
    email: "admin@microfinance.com",
    password: hashedPassword,
    role: "ADMIN",
    status: "ACTIVE",
  });

  return NextResponse.json({
    message: "✅ Admin created successfully",
    email: "admin@microfinance.com",
    password: "Admin@123",
  });
}
