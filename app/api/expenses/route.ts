import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

export async function GET() {
  await connectDB();
  const expenses = await Expense.find().sort({ expenseDate: -1 });
  return Response.json(expenses);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const expense = await Expense.create(body);
  return Response.json(expense);
}
