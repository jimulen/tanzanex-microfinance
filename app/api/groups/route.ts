import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import "@/models/Member"; // 🔥 REQUIRED
import { getOrgId } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();

  const groups = await Group.find({ organization: orgId }).populate("members");

  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name } = await req.json();

  const group = await Group.create({
    name,
    organization: orgId,
    members: []
  });

  return NextResponse.json(group, { status: 201 });
}
