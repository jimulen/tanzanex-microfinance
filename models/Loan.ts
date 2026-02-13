import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema(
  {
    // Link to borrower (Client)
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // Principal amount
    amountLoaned: {
      type: Number,
      required: true,
    },

    // Interest configuration
    interestRate: {
      type: Number,
      default: 20,
    },
    interestAmount: {
      type: Number,
      default: 0,
    },

    // Totals and tracking
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    principalOutstanding: {
      type: Number,
      default: 0,
    },

    // Duration in months
    months: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Loan ||
  mongoose.model("Loan", LoanSchema);
