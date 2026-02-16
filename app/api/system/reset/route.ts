import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getRole, getOrgId } from "@/lib/auth";
import Loan from "@/models/Loan";
import Payment from "@/models/Payment";
import Expense from "@/models/Expense";
import CashFlow from "@/models/CashFlow";
import Group from "@/models/Group";
import Member from "@/models/Member";
import Client from "@/models/Client";
import User from "@/models/User";

export async function POST(req: Request) {
    console.log("SYSTEM RESET REQUEST RECEIVED");
    const role = getRole(req);
    const orgId = getOrgId(req);

    // Strict Admin check
    if (role !== "admin" || !orgId) {
        console.warn(`UNAUTHORIZED RESET ATTEMPT: Role is ${role}, Org is ${orgId}`);
        return NextResponse.json({ message: "Unauthorized. Only Admins can reset the system." }, { status: 403 });
    }

    try {
        await connectDB();
        console.log(`Connected to DB for system reset for org: ${orgId}...`);

        // 1. Delete Financial & Operational Data for this Org only
        const results = await Promise.all([
            Loan.deleteMany({ organization: orgId }),
            Payment.deleteMany({ organization: orgId }),
            Expense.deleteMany({ organization: orgId }),
            CashFlow.deleteMany({ organization: orgId }),
            Group.deleteMany({ organization: orgId }),
            Member.deleteMany({ organization: orgId }),
            Client.deleteMany({ organization: orgId }), // Borrowers
            User.deleteMany({ organization: orgId, isOwner: { $ne: true } }), // Delete all expect the owner admin
        ]);

        console.log("System reset success:", results);

        return NextResponse.json({
            message: "System has been reset successfully. All operational data and non-admin users have been cleared."
        });
    } catch (error: any) {
        console.error("SYSTEM RESET ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
