import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import { getRole, getOrgId } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const { memberId } = await req.json();

  const group = await Group.findOneAndUpdate(
    { _id: params.id, organization: orgId },
    { $addToSet: { members: memberId } },
    { new: true }
  ).populate("members");

  if (!group) {
    return NextResponse.json({ message: "Group not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json(group);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const { memberId } = await req.json();

  const group = await Group.findOneAndUpdate(
    { _id: params.id, organization: orgId },
    { $pull: { members: memberId } },
    { new: true }
  ).populate("members");

  if (!group) {
    return NextResponse.json({ message: "Group not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json(group);
}
