import Organization from "@/models/Organization";

export async function checkSubscription(organizationId: string) {
    if (!organizationId) return { isLocked: true, reason: "No organization found" };

    const org = await Organization.findById(organizationId);
    if (!org) return { isLocked: true, reason: "Organization not found" };

    const now = new Date();

    // 1. Suspension check
    if (org.subscriptionStatus === "suspended") {
        return { isLocked: true, reason: "Account suspended. Contact support." };
    }

    // 2. Trial check
    if (org.subscriptionStatus === "trial") {
        const trialDays = 7;
        const trialExpiry = new Date(org.trialStartDate);
        trialExpiry.setDate(trialExpiry.getDate() + trialDays);

        if (now > trialExpiry) {
            return { isLocked: true, reason: "Trial ended. Please subscribe to continue." };
        }
        return { isLocked: false, trialDaysLeft: Math.ceil((trialExpiry.getTime() - now.getTime()) / (1000 * 3600 * 24)) };
    }

    // 3. Active subscription check
    if (org.subscriptionStatus === "active") {
        if (org.expiryDate && now > new Date(org.expiryDate)) {
            return { isLocked: true, reason: "Subscription expired. Please renew." };
        }
        return { isLocked: false };
    }

    // 4. Expired status
    if (org.subscriptionStatus === "expired") {
        return { isLocked: true, reason: "Subscription expired. Please renew." };
    }

    return { isLocked: true, reason: "Invalid subscription status" };
}
