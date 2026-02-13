import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  try {
    const body = await req.json();
    const { name, role, active, password } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
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
  await connectDB();
  const { id } = await params;

  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
