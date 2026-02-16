import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getRole, getOrgId } from "@/lib/auth";

export const runtime = 'nodejs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin") {
    return NextResponse.json({ message: "Unauthorized: Admins only" }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;

  try {
    const body = await req.json();
    const { name, role, active, password } = body;

    const user = await User.findOne({ _id: id, organization: orgId });
    if (!user) {
      return NextResponse.json({ message: "User not found or unauthorized" }, { status: 404 });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof active !== "undefined") user.active = active;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin") {
    return NextResponse.json({ message: "Unauthorized: Admins only" }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;

  try {
    const deleted = await User.findOneAndDelete({ _id: id, organization: orgId });
    if (!deleted) {
      return NextResponse.json({ message: "User not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
