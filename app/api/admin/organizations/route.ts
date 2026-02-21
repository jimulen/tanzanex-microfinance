import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import { getRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const role = getRole(req);

    if (role !== "super-admin") {
        // Also allow if a secret key is provided for dev/seed purposes
        const url = new URL(req.url);
        const secret = url.searchParams.get("secret");
        const ADMIN_SECRET = process.env.ADMIN_SECRET || "tanzanex-super-secret-2026";

        if (secret !== ADMIN_SECRET) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }
    }

    await connectDB();

    try {
        const url = new URL(req.url);
        const includeArchived = url.searchParams.get("includeArchived");
        
        let organizations;
        if (includeArchived === "true") {
            // Fetch all organizations including archived ones
            organizations = await Organization.find().sort({ createdAt: -1 });
        } else {
            // Fetch only active organizations (exclude archived)
            organizations = await Organization.find({ 
                subscriptionStatus: { $ne: "archived" }
            }).sort({ createdAt: -1 });
        }
        
        return NextResponse.json(organizations);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
