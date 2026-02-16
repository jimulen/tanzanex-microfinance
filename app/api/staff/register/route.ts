import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getRole, getOrgId } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const role = getRole(req);
  if (role !== "admin") {
    return NextResponse.json({ message: "Unauthorized: Admins only" }, { status: 403 });
  }

  await connectDB();

  const { fullName, email, password, role: staffRole } = await req.json();
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: fullName,
    email,
    password: hashedPassword,
    role: staffRole,
    organization: orgId,
  });

  return NextResponse.json({ message: "Staff created", user }, { status: 201 });
}
