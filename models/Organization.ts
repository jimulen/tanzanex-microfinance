import mongoose, { Schema, models } from "mongoose";

const OrganizationSchema = new Schema(
    {
        name: { type: String, required: true },
        trialStartDate: { type: Date, default: Date.now },
        subscriptionStatus: {
            type: String,
            enum: ["trial", "active", "expired", "suspended", "archived"],
            default: "trial",
        },
        expiryDate: { type: Date },
        contactEmail: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        archivedAt: { type: Date },
    },
    { timestamps: true }
);

export default models.Organization || mongoose.model("Organization", OrganizationSchema);
