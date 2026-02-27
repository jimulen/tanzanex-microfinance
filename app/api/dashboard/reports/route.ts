import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Repayment from "@/models/Payment";
import Expense from "@/models/Expense";
import CashFlow from "@/models/CashFlow";
import "@/models/Client";
import "@/models/Organization";
import { getOrgId } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const orgId = getOrgId(req);
    if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const url = new URL(req.url);
    const period = url.searchParams.get("period");
    const year = url.searchParams.get("year") ? parseInt(url.searchParams.get("year")!) : new Date().getFullYear();
    const month = url.searchParams.get("month") ? parseInt(url.searchParams.get("month")!) : new Date().getMonth() + 1;

    let startDate: Date;
    let endDate: Date;

    if (period === "yearly") {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    }

    // Fetch data for the period
    const loans = await Loan.find({ 
      organization: orgId,
      createdAt: { $gte: startDate, $lt: endDate }
    });
    
    const repayments = await Repayment.find({ 
      organization: orgId,
      paidAt: { $gte: startDate, $lt: endDate }
    });
    
    const expenses = await Expense.find({ 
      organization: orgId,
      expenseDate: { $gte: startDate, $lt: endDate }
    });
    
    const cashflows = await CashFlow.find({ 
      organization: orgId,
      date: { $gte: startDate, $lt: endDate }
    });

    // Calculate metrics
    const totalLoans = loans.length;
    const activeLoans = loans.filter((loan: any) => loan.status !== "paid").length;
    const totalLoanAmount = loans.reduce((sum: number, loan: any) => sum + (Number(loan.amountLoaned) || 0), 0);
    const totalRepaid = repayments.reduce((sum: number, r: any) => sum + (Number(r.amountPaid) || 0), 0);
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    const totalInflow = cashflows.filter((c: any) => c.type === "inflow").reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
    const totalOutflow = cashflows.filter((c: any) => c.type === "outflow").reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
    const netCashFlow = totalInflow - totalOutflow;
    const netProfit = totalRepaid - totalExpenses;
    const availableCash = netCashFlow + netProfit;

    // Daily breakdown
    const dailyData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLoans = loans.filter((loan: any) => {
        const loanDate = new Date(loan.createdAt);
        return loanDate >= dayStart && loanDate < dayEnd;
      });

      const dayRepayments = repayments.filter((rep: any) => {
        const repDate = new Date(rep.paidAt);
        return repDate >= dayStart && repDate < dayEnd;
      });

      const dayExpenses = expenses.filter((exp: any) => {
        const expDate = new Date(exp.expenseDate);
        return expDate >= dayStart && expDate < dayEnd;
      });

      const dayInflows = cashflows.filter((cf: any) => {
        const cfDate = new Date(cf.date);
        return cfDate >= dayStart && cfDate < dayEnd && cf.type === "inflow";
      });

      const dayOutflows = cashflows.filter((cf: any) => {
        const cfDate = new Date(cf.date);
        return cfDate >= dayStart && cfDate < dayEnd && cf.type === "outflow";
      });

      dailyData.push({
        date: `${year}-${month.toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
        loans: dayLoans.length,
        loanAmount: dayLoans.reduce((sum: number, loan: any) => sum + (Number(loan.amountLoaned) || 0), 0),
        repayments: dayRepayments.reduce((sum: number, rep: any) => sum + (Number(rep.amountPaid) || 0), 0),
        expenses: dayExpenses.reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0),
        inflow: dayInflows.reduce((sum: number, cf: any) => sum + (Number(cf.amount) || 0), 0),
        outflow: dayOutflows.reduce((sum: number, cf: any) => sum + (Number(cf.amount) || 0), 0),
      });

      // Fix: Create new date to avoid mutation issues
      currentDate.setTime(currentDate.getTime() + (24 * 60 * 60 * 1000)); // Add 24 hours
    }

    // Monthly breakdown for yearly reports
    let monthlyData = [];
    if (period === "yearly") {
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(year, m, 1);
        const monthEnd = new Date(year, m + 1, 1);

        const monthLoans = loans.filter((loan: any) => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= monthStart && loanDate < monthEnd;
        });

        const monthRepayments = repayments.filter((rep: any) => {
          const repDate = new Date(rep.paidAt);
          return repDate >= monthStart && repDate < monthEnd;
        });

        const monthExpenses = expenses.filter((exp: any) => {
          const expDate = new Date(exp.expenseDate);
          return expDate >= monthStart && expDate < monthEnd;
        });

        const monthInflows = cashflows.filter((cf: any) => {
          const cfDate = new Date(cf.date);
          return cfDate >= monthStart && cfDate < monthEnd && cf.type === "inflow";
        });

        const monthOutflows = cashflows.filter((cf: any) => {
          const cfDate = new Date(cf.date);
          return cfDate >= monthStart && cfDate < monthEnd && cf.type === "outflow";
        });

        monthlyData.push({
          month: m + 1,
          monthName: new Date(year, m, 1).toLocaleString('default', { month: 'long' }),
          loans: monthLoans.length,
          loanAmount: monthLoans.reduce((sum: number, loan: any) => sum + (Number(loan.amountLoaned) || 0), 0),
          repayments: monthRepayments.reduce((sum: number, rep: any) => sum + (Number(rep.amountPaid) || 0), 0),
          expenses: monthExpenses.reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0),
          inflow: monthInflows.reduce((sum: number, cf: any) => sum + (Number(cf.amount) || 0), 0),
          outflow: monthOutflows.reduce((sum: number, cf: any) => sum + (Number(cf.amount) || 0), 0),
        });
      }
    }

    return NextResponse.json({
      period,
      year,
      month: period === "monthly" ? month : undefined,
      summary: {
        totalLoans,
        activeLoans,
        totalLoanAmount,
        totalRepaid,
        totalExpenses,
        totalInflow,
        totalOutflow,
        netCashFlow,
        netProfit,
        availableCash,
        outstandingBalance: totalLoanAmount - totalRepaid
      },
      dailyData,
      monthlyData: period === "yearly" ? monthlyData : undefined
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    console.error("REPORTS API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
