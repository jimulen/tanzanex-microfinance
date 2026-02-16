import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getRole, getOrgId } from "@/lib/auth";

export const runtime = 'nodejs';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = getRole(req);
  const orgId = getOrgId(req);
  const { id } = await params;

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const data = await req.json();

  const member = await Member.findOneAndUpdate({ _id: id, organization: orgId }, data, {
    new: true,
  });

  if (!member) {
    return NextResponse.json({ message: "Member not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json(member);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = getRole(req);
  const orgId = getOrgId(req);
  const { id } = await params;

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const deleted = await Member.findOneAndDelete({ _id: id, organization: orgId });
  if (!deleted) {
    return NextResponse.json({ message: "Member not found or unauthorized" }, { status: 404 });
  }
  return NextResponse.json({ message: "Member deleted" });
}
