import mongoose, { Schema, models } from "mongoose";

const ExpenseSchema = new Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String }, // rent, salary, fuel, etc
    expenseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Expense || mongoose.model("Expense", ExpenseSchema);
