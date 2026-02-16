import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getRole, getOrgId } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const members = await Member.find({ organization: orgId }).sort({ createdAt: -1 });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const data = await req.json();

  const member = await Member.create({
    ...data,
    organization: orgId,
  });
  return NextResponse.json(member, { status: 201 });
}
