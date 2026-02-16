import mongoose, { Schema, models } from "mongoose";

const CashFlowSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["inflow", "outflow"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            default: "Capital", // Default to Capital as requested
        },
        date: {
            type: Date,
            default: Date.now,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
    },
    { timestamps: true }
);

export default models.CashFlow || mongoose.model("CashFlow", CashFlowSchema);
