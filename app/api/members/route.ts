import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";

export async function GET() {
  await connectDB();
  const members = await Member.find().sort({ createdAt: -1 });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  const member = await Member.create(data);
  return NextResponse.json(member, { status: 201 });
}
