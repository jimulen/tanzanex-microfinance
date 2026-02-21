import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

/* GET all admins - super admin only */
export async function GET(req: Request) {
    console.log("Admins API called");
    
    // Check for secret parameter (super-admin page uses secret, not JWT)
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    console.log("Secret received:", secret);
    
    if (secret !== "tanzanex-super-secret-2026") {
        console.log("Invalid secret");
        return NextResponse.json({ message: "Invalid secret key" }, { status: 401 });
    }

    try {
        console.log("Secret validated, fetching from User collection");
        await connectDB();
        
        // Fetch all users with admin roles from User collection, exclude password field
        const adminUsers = await User.find({
            role: { $in: ["admin", "manager", "super-admin"] }
        })
            .select('-password')
            .sort({ createdAt: -1 });

        console.log("Found admin users in database:", adminUsers.length);

        // Transform data to match expected format
        const transformedAdmins = adminUsers.map((user: any) => ({
            _id: user._id,
            name: user.name || user.email.split('@')[0], // Use name field or email prefix
            email: user.email,
            role: user.role,
            status: user.active ? 'active' : 'inactive', // Use active field from User model
            lastLogin: user.updatedAt || user.createdAt, // Use updatedAt as last login approximation
            createdAt: user.createdAt,
            permissions: getPermissionsByRole(user.role),
            organization: user.organization || "tanzanex-main"
        }));

        console.log("Transformed admins:", transformedAdmins.length);

        return NextResponse.json({
            admins: transformedAdmins,
            total: transformedAdmins.length,
            active: transformedAdmins.filter(a => a.status === 'active').length,
            inactive: transformedAdmins.filter(a => a.status === 'inactive').length
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper function to get permissions based on role
function getPermissionsByRole(role: string) {
    switch (role) {
        case 'super-admin':
            return ["manage_loans", "manage_borrowers", "view_reports", "manage_staff", "manage_admins", "system_settings"];
        case 'admin':
            return ["manage_loans", "manage_borrowers", "view_reports"];
        case 'manager':
            return ["manage_loans", "manage_borrowers", "view_reports", "manage_staff"];
        default:
            return ["view_reports"];
    }
}
