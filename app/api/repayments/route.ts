import { connectDB } from "@/lib/db";
import Repayment from "@/models/Payment";
import Loan from "@/models/Loan";
import "@/models/Member";
import { getRole, getOrgId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Fetch repayments and populate borrower via loan
  const repayments = await Repayment.find({ organization: orgId })
    .populate({
      path: "loan",
      populate: { path: "borrower", select: "fullName" },
    })
    .sort({ paidAt: -1 });

  return NextResponse.json(repayments);
}

export async function POST(req: Request) {
  const role = getRole(req);
  const orgId = getOrgId(req);

  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!role || (role !== "admin" && role !== "manager" && role !== "staff" && role !== "officer")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();

  try {
    const { loanId, amount } = await req.json();

    if (!loanId || !amount) throw new Error("Loan and amount required");

    // Update loan balance
    const loan = await Loan.findOne({ _id: loanId, organization: orgId });
    if (!loan) throw new Error("Loan not found or unauthorized");

    // Create repayment
    const repayment = await Repayment.create({
      loan: loanId,
      amountPaid: amount,
      paidAt: new Date(),
      organization: orgId,
    });

    loan.paidAmount += amount;
    loan.principalOutstanding = loan.totalAmount - loan.paidAmount;

    if (loan.principalOutstanding <= 0) {
      loan.principalOutstanding = 0;
      loan.status = "paid";
    }

    await loan.save();

    return new Response(JSON.stringify(repayment), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
