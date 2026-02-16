import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Repayment from "@/models/Payment";
import Expense from "@/models/Expense";
import CashFlow from "@/models/CashFlow";
import "@/models/Member"; // ✅ FORCE REGISTER MODEL
import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();

  const loans = await Loan.find({ organization: orgId });
  const repayments = await Repayment.find({ organization: orgId });
  const expenses = await Expense.find({ organization: orgId });
  const cashflows = await CashFlow.find({ organization: orgId });

  const totalLoans = loans.length;
  const activeLoans = loans.filter(
    (loan: any) => loan.status !== "paid"
  ).length;

  const totalLoanPrincipal = loans.reduce(
    (sum: number, loan: any) => sum + (Number(loan.amountLoaned) || 0),
    0
  );

  const totalRepaid = repayments.reduce(
    (sum: number, r: any) => sum + (Number(r.amountPaid) || 0),
    0
  );

  const outstandingBalance = totalLoanPrincipal - totalRepaid;

  const totalExpenses = expenses.reduce(
    (sum: number, e: any) => sum + (Number(e.amount) || 0),
    0
  );

  const totalInflow = cashflows
    .filter((c: any) => c.type === "inflow")
    .reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);

  const totalOutflow = cashflows
    .filter((c: any) => c.type === "outflow")
    .reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);

  const netCashFlow = totalInflow - totalOutflow;

  // Expenses breakdown
  const operationalExpenses = totalExpenses; // (Sum of Expense model)
  const manualOutflows = totalOutflow; // (Sum of CashFlow outflow)
  const totalOutflowsCombined = operationalExpenses + manualOutflows;

  // Net Profit = (Repayments + manual Inflows) - (Operational Expenses + manual Outflows)
  // Simplified for consistency: Net Profit = Repayments - Operational Expenses
  const netProfit = totalRepaid - operationalExpenses;

  // Available Liquidity = Net Cash Flow (manual movements) + Repayments - Operational Expenses
  const availableCash = netCashFlow + netProfit;

  return Response.json({
    totalLoans,
    activeLoans,
    outstandingBalance,
    totalRepaid,
    totalExpenses: totalOutflowsCombined, // Map total for the main KPI
    operationalExpenses,
    manualOutflows,
    netProfit,
    totalInflow,
    totalOutflow,
    netCashFlow,
    availableCash,
  });
}
