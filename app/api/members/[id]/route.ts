import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const data = await req.json();

  const member = await Member.findByIdAndUpdate(params.id, data, {
    new: true,
  });

  return NextResponse.json(member);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  await Member.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Member deleted" });
}
