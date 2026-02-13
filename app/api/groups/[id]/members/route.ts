import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { memberId } = await req.json();

  const group = await Group.findByIdAndUpdate(
    params.id,
    { $addToSet: { members: memberId } },
    { new: true }
  ).populate("members");

  return NextResponse.json(group);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { memberId } = await req.json();

  const group = await Group.findByIdAndUpdate(
    params.id,
    { $pull: { members: memberId } },
    { new: true }
  ).populate("members");

  return NextResponse.json(group);
}
