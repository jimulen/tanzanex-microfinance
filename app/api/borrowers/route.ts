import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Borrower from "@/models/Client";
import { getRole, getOrgId } from "@/lib/auth";

export const runtime = 'nodejs';

/* GET all borrowers */
export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const borrowers = await Borrower.find({ organization: orgId }).sort({ createdAt: -1 });
  return NextResponse.json(borrowers);
}

/* POST create borrower */
export async function POST(req: Request) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!role || (role !== "admin" && role !== "manager" && role !== "staff" && role !== "officer")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const borrower = await Borrower.create({
    ...body,
    organization: orgId,
  });
  return NextResponse.json(borrower);
}
