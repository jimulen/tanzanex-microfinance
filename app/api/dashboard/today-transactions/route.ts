import { connectDB } from "@/lib/db";
import CashFlow from "@/models/CashFlow";
import Expense from "@/models/Expense";
import Repayment from "@/models/Payment";
import { getRole, getOrgId } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

/* GET today's transactions */
export async function GET(req: Request) {
    const role = getRole(req);
    const orgId = getOrgId(req);

    if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!role) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        // Get today's date range (start of day to end of day)
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // 1. Fetch today's manual cash flow transactions
        const manualTransactions = await CashFlow.find({ 
            organization: orgId,
            date: { $gte: startOfDay, $lt: endOfDay }
        }).sort({ date: -1 });

        // 2. Fetch today's operational expenses
        const expenses = await Expense.find({ 
            organization: orgId,
            expenseDate: { $gte: startOfDay, $lt: endOfDay }
        }).sort({ expenseDate: -1 });
        
        const mappedExpenses = expenses.map((e: any) => ({
            _id: e._id,
            type: "outflow",
            amount: e.amount,
            description: e.title,
            category: e.category || "Expense",
            date: e.expenseDate
        }));

        // 3. Fetch today's loan repayments
        const repayments = await Repayment.find({ 
            organization: orgId,
            paidAt: { $gte: startOfDay, $lt: endOfDay }
        }).sort({ paidAt: -1 });
        
        const mappedRepayments = repayments.map((r: any) => ({
            _id: r._id,
            type: "inflow",
            amount: r.amountPaid || 0,
            description: "Loan Repayment",
            category: "Repayment",
            date: r.paidAt
        }));

        // Combine and sort by date descending
        const todayTransactions = [
            ...manualTransactions,
            ...mappedExpenses,
            ...mappedRepayments
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Calculate today's totals
        const todayInflows = todayTransactions
            .filter(t => t.type === "inflow")
            .reduce((sum, t) => sum + t.amount, 0);
            
        const todayOutflows = todayTransactions
            .filter(t => t.type === "outflow")
            .reduce((sum, t) => sum + t.amount, 0);

        const todayNet = todayInflows - todayOutflows;

        return NextResponse.json({
            transactions: todayTransactions,
            summary: {
                inflows: todayInflows,
                outflows: todayOutflows,
                net: todayNet,
                count: todayTransactions.length
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
