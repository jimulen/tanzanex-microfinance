import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export const runtime = 'nodejs';

// Optional helper GET so visiting /api/auth/login in the browser
// returns a friendly message instead of a 405.
export async function GET() {
  return NextResponse.json({
    message: "Login endpoint. Use POST with { email, password }.",
  });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const email = body?.email as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return NextResponse.json(
        { message: "Server config error: JWT secret missing" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizationId: user.organization,
      },
      secret,
      { expiresIn: "1d" }
    );

    // Frontend expects a JSON object with { token }
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
