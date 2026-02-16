import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getOrgId } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        await connectDB();
        const orgId = getOrgId(req);

        if (!orgId) {
            return NextResponse.json({ isLocked: true, reason: "Not authenticated" }, { status: 401 });
        }

        const status = await checkSubscription(orgId);
        return NextResponse.json(status);
    } catch (error) {
        return NextResponse.json({ isLocked: true, reason: "Server error" }, { status: 500 });
    }
}
