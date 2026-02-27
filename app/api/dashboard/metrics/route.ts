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

  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Fetch today's data
  const todayLoans = await Loan.find({ 
    organization: orgId,
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  });
  
  const todayRepayments = await Repayment.find({ 
    organization: orgId,
    paidAt: { $gte: startOfDay, $lt: endOfDay }
  });
  
  const todayExpenses = await Expense.find({ 
    organization: orgId,
    expenseDate: { $gte: startOfDay, $lt: endOfDay }
  });
  
  const todayCashflows = await CashFlow.find({ 
    organization: orgId,
    date: { $gte: startOfDay, $lt: endOfDay }
  });

  // Today's metrics
  const todayLoansCount = todayLoans.length;
  const todayActiveLoans = todayLoans.filter(
    (loan: any) => loan.status !== "paid"
  ).length;

  const todayLoanAmount = todayLoans.reduce(
    (sum: number, loan: any) => sum + (Number(loan.amountLoaned) || 0),
    0
  );

  const todayRepaid = todayRepayments.reduce(
    (sum: number, r: any) => sum + (Number(r.amountPaid) || 0),
    0
  );

  const todayExpensesAmount = todayExpenses.reduce(
    (sum: number, e: any) => sum + (Number(e.amount) || 0),
    0
  );

  const todayInflow = todayCashflows
    .filter((c: any) => c.type === "inflow")
    .reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);

  const todayOutflow = todayCashflows
    .filter((c: any) => c.type === "outflow")
    .reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);

  const todayNetCashFlow = todayInflow - todayOutflow;
  const todayNetProfit = todayRepaid - todayExpensesAmount;
  const todayAvailableCash = todayNetCashFlow + todayNetProfit;

  return NextResponse.json({
    // Today's metrics
    todayLoans: todayLoansCount,
    todayActiveLoans: todayActiveLoans,
    todayLoanAmount,
    todayRepaid,
    todayExpenses: todayExpensesAmount + todayOutflow, // Combined expenses
    operationalExpenses: todayExpensesAmount,
    manualOutflows: todayOutflow,
    todayNetProfit,
    todayInflow,
    todayOutflow,
    todayNetCashFlow,
    todayAvailableCash,
    
    // Keep some totals for reference
    totalLoans: (await Loan.find({ organization: orgId })).length,
    totalActiveLoans: (await Loan.find({ organization: orgId, status: { $ne: "paid" } })).length,
    totalOutstandingBalance: (await Loan.find({ organization: orgId })).reduce(
      (sum: number, loan: any) => sum + (Number(loan.amountLoaned) || 0), 0
    ) - (await Repayment.find({ organization: orgId })).reduce(
      (sum: number, r: any) => sum + (Number(r.amountPaid) || 0), 0
    )
  }, {
    // Add cache control headers to prevent stale data
    headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
  });
}
