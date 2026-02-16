import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
  amountPaid: Number,
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  paidAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
