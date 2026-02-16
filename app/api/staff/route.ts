import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getRole, getOrgId } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  // Fetch only staff/admin roles for the organization
  const staff = await User.find({ organization: orgId }).select("-password").sort({ createdAt: -1 });
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin") {
    return NextResponse.json({ message: "Unauthorized: Admins only" }, { status: 403 });
  }

  await connectDB();

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      organization: orgId,
      active: true,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create staff" },
      { status: 500 }
    );
  }
}
