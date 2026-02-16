import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Repayment from "@/models/Payment";

import { getOrgId } from "@/lib/auth";

export async function GET(req: Request) {
  const orgId = getOrgId(req);
  if (!orgId) return Response.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();

  const loans = await Loan.find({ organization: orgId });
  const repayments = await Repayment.find({ organization: orgId });

  // Group by month
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const chartData = months.map((month) => {
    const loanSum = loans
      .filter((l: any) => new Date(l.issuedAt).getMonth() + 1 === month)
      .reduce((sum: number, l: any) => sum + (l.amountLoaned || l.amount || 0), 0);

    const repaymentSum = repayments
      .filter((r: any) => new Date(r.paidAt).getMonth() + 1 === month)
      .reduce((sum: number, r: any) => sum + (r.amountPaid || r.amount || 0), 0);

    return {
      month: month.toString(),
      loans: loanSum,
      repayments: repaymentSum,
    };
  });

  return Response.json(chartData);
}
