import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import User from "@/models/User";
import Client from "@/models/Client";
import Loan from "@/models/Loan";
import Payment from "@/models/Payment";
import Expense from "@/models/Expense";
import CashFlow from "@/models/CashFlow";
import Group from "@/models/Group";
import Member from "@/models/Member";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    const ADMIN_SECRET = process.env.ADMIN_SECRET || "tanzanex-super-secret-2026";

    if (secret !== ADMIN_SECRET) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    try {
        // 1. Create or get default organization
        let mainOrg = await Organization.findOne({ name: "Tanzanex Main" });
        if (!mainOrg) {
            mainOrg = await Organization.create({
                name: "Tanzanex Main",
                subscriptionStatus: "active",
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)), // 10 years for legacy
            });
        }

        const orgId = mainOrg._id;

        // 2. Migration function
        const migrate = async (Model: any, label: string) => {
            const result = await Model.updateMany(
                { organization: { $exists: false } },
                { $set: { organization: orgId } }
            );
            return { label, modified: result.modifiedCount };
        };

        // 3. Run migrations for all models
        const stats = await Promise.all([
            migrate(User, "Users"),
            migrate(Client, "Borrowers"),
            migrate(Loan, "Loans"),
            migrate(Payment, "Payments"),
            migrate(Expense, "Expenses"),
            migrate(CashFlow, "CashFlows"),
            migrate(Group, "Groups"),
            migrate(Member, "Members"),
        ]);

        // 4. Special case: Set the first migrated user as owner
        await User.findOneAndUpdate(
            { organization: orgId, role: "admin" },
            { isOwner: true }
        );

        return NextResponse.json({
            message: "Migration completed successfully",
            organization: mainOrg.name,
            stats,
        });
    } catch (err: any) {
        console.error("Migration Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
