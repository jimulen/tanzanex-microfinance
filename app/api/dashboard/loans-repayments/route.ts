import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Repayment from "@/models/Payment";

export async function GET() {
  await connectDB();

  const loans = await Loan.find();
  const repayments = await Repayment.find();

  // Group by month
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const chartData = months.map((month) => {
    const loanSum = loans
      .filter((l) => new Date(l.issuedAt).getMonth() + 1 === month)
      .reduce((sum, l) => sum + (l.amount || 0), 0);

    const repaymentSum = repayments
      .filter((r) => new Date(r.paidAt).getMonth() + 1 === month)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      month: month.toString(),
      loans: loanSum,
      repayments: repaymentSum,
    };
  });

  return Response.json(chartData);
}
