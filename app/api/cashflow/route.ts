import { connectDB } from "@/lib/db";
import CashFlow from "@/models/CashFlow";
import Expense from "@/models/Expense";
import Repayment from "@/models/Payment";
import { getRole, getOrgId } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

/* GET all cash flow transactions (Admin/Manager only) */
export async function GET(req: Request) {
    const role = getRole(req);
    const orgId = getOrgId(req);

    if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (role !== "admin" && role !== "manager") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        await connectDB();

        // 1. Fetch manual cash flow transactions
        const manualTransactions = await CashFlow.find({ organization: orgId }).sort({ date: -1 });

        // 2. Fetch operational expenses and map them as "outflow"
        const expenses = await Expense.find({ organization: orgId }).sort({ expenseDate: -1 });
        const mappedExpenses = expenses.map((e: any) => ({
            _id: e._id,
            type: "outflow",
            amount: e.amount,
            description: e.title,
            category: e.category || "Expense",
            date: e.expenseDate
        }));

        // 3. Fetch loan repayments and map them as "inflow"
        const repayments = await Repayment.find({ organization: orgId }).sort({ paidAt: -1 });
        const mappedRepayments = repayments.map((r: any) => ({
            _id: r._id,
            type: "inflow",
            amount: r.amountPaid || 0,
            description: "Loan Repayment",
            category: "Repayment",
            date: r.paidAt
        }));

        // Combine and sort by date descending
        const allTransactions = [
            ...manualTransactions,
            ...mappedExpenses,
            ...mappedRepayments
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(allTransactions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/* POST add new cash flow transaction */
export async function POST(req: Request) {
    const role = getRole(req);
    const orgId = getOrgId(req);

    if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!role) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    try {
        const body = await req.json();

        // Enforce reason (description)
        if (!body.description || body.description.trim() === "") {
            return NextResponse.json({ message: "A reason (description) is strictly required to record cash flow." }, { status: 400 });
        }

        const transaction = await CashFlow.create({
            ...body,
            organization: orgId,
        });
        return NextResponse.json(transaction, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
