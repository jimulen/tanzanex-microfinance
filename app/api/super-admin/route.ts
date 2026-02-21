import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = 'nodejs';

/* GET super admin access - verify super admin role */
export async function GET(req: Request) {
    // Check for secret parameter (super-admin page uses secret, not JWT)
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    if (secret !== "tanzanex-super-secret-2026") {
        return NextResponse.json({ message: "Invalid secret key" }, { status: 401 });
    }

    try {
        // For now, return success - in real implementation, you'd fetch sensitive data
        return NextResponse.json({
            message: "Super admin access granted",
            features: [
                "view_all_admins",
                "edit_admin_passwords", 
                "view_system_logs",
                "manage_api_keys",
                "system_settings",
                "backup_data",
                "emergency_reset"
            ]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/* POST - update admin password or sensitive info */
export async function POST(req: Request) {
    console.log("Super admin POST API called");
    
    // Check for secret parameter
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    console.log("Secret received in POST:", secret);
    
    if (secret !== "tanzanex-super-secret-2026") {
        console.log("Invalid secret in POST");
        return NextResponse.json({ message: "Invalid secret key" }, { status: 401 });
    }

    try {
        await connectDB();
        const body = await req.json();
        console.log("Request body:", body);
        
        const { action, adminId, newPassword, newEmail, notes, orgId } = body;

        switch (action) {
            case "reset_admin_password":
                console.log("Processing password reset for admin:", adminId);
                
                // Reset specific admin password
                if (!adminId || !newPassword) {
                    console.log("Missing adminId or newPassword");
                    return NextResponse.json({ 
                        message: "Admin ID and new password are required" 
                    }, { status: 400 });
                }

                // Hash new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                console.log("Password hashed successfully");
                
                // Update user in database
                const updatedUser = await User.findByIdAndUpdate(
                    adminId, 
                    { 
                        password: hashedPassword,
                        updatedAt: new Date()
                    },
                    { new: true }
                ).select('-password');

                console.log("User update result:", updatedUser);

                if (!updatedUser) {
                    console.log("User not found");
                    return NextResponse.json({ 
                        message: "Admin not found" 
                    }, { status: 404 });
                }

                console.log("Password reset successful for:", updatedUser.email);

                return NextResponse.json({
                    message: "Admin password reset successfully",
                    adminId: updatedUser._id,
                    adminEmail: updatedUser.email,
                    resetAt: new Date().toISOString()
                });

            case "archive":
                console.log("Archiving organization:", orgId);
                
                if (!orgId) {
                    return NextResponse.json({ 
                        message: "Organization ID is required for archiving" 
                    }, { status: 400 });
                }

                // Archive organization (soft delete)
                const archivedOrg = await Organization.findByIdAndUpdate(
                    orgId,
                    { 
                        subscriptionStatus: "archived",
                        archivedAt: new Date()
                    },
                    { new: true }
                );

                if (!archivedOrg) {
                    return NextResponse.json({ 
                        message: "Organization not found" 
                    }, { status: 404 });
                }

                console.log("Organization archived successfully:", archivedOrg.name);

                return NextResponse.json({
                    message: "Organization archived successfully",
                    orgId: archivedOrg._id,
                    orgName: archivedOrg.name,
                    archivedAt: new Date().toISOString()
                });

            case "delete":
                console.log("Deleting organization:", orgId);
                
                if (!orgId) {
                    return NextResponse.json({ 
                        message: "Organization ID is required for deletion" 
                    }, { status: 400 });
                }

                // First, find the organization to get its name for logging
                const orgToDelete = await Organization.findById(orgId);
                if (!orgToDelete) {
                    return NextResponse.json({ 
                        message: "Organization not found" 
                    }, { status: 404 });
                }

                // Delete the organization (hard delete)
                const deletedOrg = await Organization.findByIdAndDelete(orgId);

                if (!deletedOrg) {
                    return NextResponse.json({ 
                        message: "Failed to delete organization" 
                    }, { status: 500 });
                }

                console.log("Organization deleted permanently:", deletedOrg.name);

                return NextResponse.json({
                    message: "Organization deleted permanently",
                    orgId: deletedOrg._id,
                    orgName: deletedOrg.name,
                    deletedAt: new Date().toISOString()
                });

            case "restore":
                console.log("Restoring organization:", orgId);
                
                if (!orgId) {
                    return NextResponse.json({ 
                        message: "Organization ID is required for restoration" 
                    }, { status: 400 });
                }

                // Restore organization (remove archived status)
                const restoredOrg = await Organization.findByIdAndUpdate(
                    orgId,
                    { 
                        $unset: { archivedAt: 1 },
                        subscriptionStatus: "active"
                    },
                    { new: true }
                );

                if (!restoredOrg) {
                    return NextResponse.json({ 
                        message: "Organization not found" 
                    }, { status: 404 });
                }

                console.log("Organization restored successfully:", restoredOrg.name);

                return NextResponse.json({
                    message: "Organization restored successfully",
                    orgId: restoredOrg._id,
                    orgName: restoredOrg.name,
                    restoredAt: new Date().toISOString()
                });

            case "update_admin_email":
                // Update admin email
                if (!adminId || !newEmail) {
                    return NextResponse.json({ 
                        message: "Admin ID and new email are required" 
                    }, { status: 400 });
                }

                // Check if email already exists
                const existingUser = await User.findOne({ email: newEmail });
                if (existingUser && existingUser._id.toString() !== adminId) {
                    return NextResponse.json({ 
                        message: "Email already exists" 
                    }, { status: 400 });
                }

                // Update user email in database
                const updatedEmailUser = await User.findByIdAndUpdate(
                    adminId, 
                    { 
                        email: newEmail,
                        updatedAt: new Date()
                    },
                    { new: true }
                ).select('-password');

                if (!updatedEmailUser) {
                    return NextResponse.json({ 
                        message: "Admin not found" 
                    }, { status: 404 });
                }

                return NextResponse.json({
                    message: "Admin email updated successfully",
                    adminId: updatedEmailUser._id,
                    newEmail: updatedEmailUser.email,
                    updatedAt: new Date().toISOString()
                });

            case "emergency_disable_admin":
                // Emergency disable admin account
                if (!adminId) {
                    return NextResponse.json({ 
                        message: "Admin ID is required for emergency disable" 
                    }, { status: 400 });
                }

                // For now, we'll just log this action since User model doesn't have status field for disabling
                // In real implementation, you might want to add status field to User model
                const userToDisable = await User.findById(adminId);
                if (!userToDisable) {
                    return NextResponse.json({ 
                        message: "Admin not found" 
                    }, { status: 404 });
                }

                // Log the action (you might want to create an AuditLog model)
                console.log(`Emergency disable requested for admin: ${userToDisable.email} by super-admin. Reason: ${notes || 'Emergency disable by super-admin'}`);

                return NextResponse.json({
                    message: "Admin disable action logged successfully",
                    adminId: userToDisable._id,
                    adminEmail: userToDisable.email,
                    disabledAt: new Date().toISOString(),
                    note: "Action logged. Consider implementing actual disable functionality."
                });

            default:
                return NextResponse.json({ 
                    message: "Invalid action specified" 
                }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Super admin API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
