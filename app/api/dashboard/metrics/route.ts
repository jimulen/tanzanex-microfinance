import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Repayment from "@/models/Payment";
import Expense from "@/models/Expense";
import "@/models/Member"; // ✅ FORCE REGISTER MODEL
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const loans = await Loan.find();
  const repayments = await Repayment.find();
  const expenses = await Expense.find();

  const totalLoans = loans.length;
  const activeLoans = loans.filter(
    (loan: any) => loan.status !== "paid"
  ).length;

  const totalLoanPrincipal = loans.reduce(
    (sum: number, loan: any) => sum + (loan.amount || 0),
    0
  );

  const totalRepaid = repayments.reduce(
    (sum: number, r: any) => sum + (r.amountPaid || 0),
    0
  );

  const outstandingBalance = totalLoanPrincipal - totalRepaid;

  const totalExpenses = expenses.reduce(
    (sum: number, e: any) => sum + (e.amount || 0),
    0
  );

  const netProfit = totalRepaid - totalExpenses;

  return NextResponse.json({
    totalLoans,
    activeLoans,
    outstandingBalance,
    totalRepaid,
    totalExpenses,
    netProfit,
  });
}
