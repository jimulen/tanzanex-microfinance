import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  await connectDB();

  await User.deleteOne({ email: "admin@tanzanex.com" });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "System Admin",
    email: "admin@tanzanex.com",
    password: hashedPassword,
    role: "admin",
  });

  return NextResponse.json({
    message: "Admin recreated",
    email: "admin@tanzanex.com",
    password: "admin123",
    hash: hashedPassword,
  });
}
