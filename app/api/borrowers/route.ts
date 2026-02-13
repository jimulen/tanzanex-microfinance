import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Borrower from "@/models/Client";

/* GET all borrowers */
export async function GET() {
  await connectDB();
  const borrowers = await Borrower.find().sort({ createdAt: -1 });
  return NextResponse.json(borrowers);
}

/* POST create borrower */
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const borrower = await Borrower.create(body);
  return NextResponse.json(borrower);
}
