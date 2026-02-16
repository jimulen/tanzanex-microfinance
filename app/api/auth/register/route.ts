import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

import Organization from "@/models/Organization";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password, organizationName } = await req.json();

  if (!organizationName) {
    return NextResponse.json({ message: "Organization name is required" }, { status: 400 });
  }

  // Create Organization
  const org = await Organization.create({
    name: organizationName,
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User as Admin/Owner of the Org
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
    organization: org._id,
    isOwner: true,
  });

  return NextResponse.json({ user, organization: org });
}
