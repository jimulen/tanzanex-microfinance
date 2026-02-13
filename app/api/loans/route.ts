import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import "@/models/Client"; // Register Client schema
import "@/models/Member"; // Register Member schema if needed for other routes

/* GET all loans */
export async function GET() {
  await connectDB();

  const loans = await Loan.find()
    .populate("borrower") // borrower -> Client
    .sort({ createdAt: -1 });

  return NextResponse.json(loans);
}

/* POST create loan */
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const rawAmount =
    typeof body.amountLoaned !== "undefined"
      ? Number(body.amountLoaned)
      : Number(body.amount);

  if (!body.borrower || !rawAmount || Number.isNaN(rawAmount)) {
    return NextResponse.json(
      { message: "Borrower and valid amount are required" },
      { status: 400 }
    );
  }

  const interestRate = Number(body.interestRate ?? 20);
  const interestAmount = (rawAmount * interestRate) / 100;
  const totalAmount = rawAmount + interestAmount;
  const months = Number(body.months ?? body.duration ?? 1);

  const loan = await Loan.create({
    borrower: body.borrower,
    amountLoaned: rawAmount,
    interestRate,
    interestAmount,
    totalAmount,
    paidAmount: 0,
    principalOutstanding: totalAmount,
    months,
  });

  return NextResponse.json(loan);
}
