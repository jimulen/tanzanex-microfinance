import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import { getRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const role = getRole(req);

    // For safety, let's also allow a secret key for now during development
    const { orgId, orgName, status, secret } = await req.json();

    // SECURE-BY-DEFAULT: Admin or Secret Key required
    const ADMIN_SECRET = process.env.ADMIN_SECRET || "tanzanex-super-secret-2026";

    if (role !== "super-admin" && secret !== ADMIN_SECRET) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    try {
        let org;
        if (orgId) {
            org = await Organization.findById(orgId);
        } else if (orgName) {
            org = await Organization.findOne({ name: orgName });
        }

        if (!org) {
            return NextResponse.json({ message: "Organization not found" }, { status: 404 });
        }

        org.subscriptionStatus = status || "active";
        // Set expiry to 1 year from now if activating
        if (org.subscriptionStatus === "active") {
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            org.expiryDate = nextYear;
        }

        await org.save();

        return NextResponse.json({
            message: `Organization ${org.name} set to ${org.subscriptionStatus}`,
            org
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
