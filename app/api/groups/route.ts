import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import "@/models/Member"; // 🔥 REQUIRED

export async function GET() {
  await connectDB();

  const groups = await Group.find().populate("members");

  return NextResponse.json(groups);
}
