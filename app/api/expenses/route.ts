import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import { getRole, getOrgId } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const expenses = await Expense.find({ organization: orgId }).sort({ expenseDate: -1 });
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const expense = await Expense.create({
    ...body,
    organization: orgId,
  });
  return NextResponse.json(expense);
}
