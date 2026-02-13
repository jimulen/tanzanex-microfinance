import { connectDB } from "@/lib/db";
import Repayment from "@/models/Payment";
import Loan from "@/models/Loan";
import "@/models/Member";

export async function GET() {
  await connectDB();

  // Fetch repayments and populate borrower via loan
  const repayments = await Repayment.find()
    .populate({
      path: "loan",
      populate: { path: "borrower", select: "fullName" },
    })
    .sort({ paidAt: -1 });

  return new Response(JSON.stringify(repayments));
}

export async function POST(req: Request) {
  await connectDB();

  try {
    const { loanId, amount } = await req.json();

    if (!loanId || !amount) throw new Error("Loan and amount required");

    // Create repayment
    const repayment = await Repayment.create({
      loan: loanId,
      amountPaid: amount,
      paidAt: new Date(),
    });

    // Update loan balance
    const loan = await Loan.findById(loanId);
    if (!loan) throw new Error("Loan not found");

    loan.paidAmount += amount;
    loan.principalOutstanding = loan.totalAmount - loan.paidAmount;
    
    if (loan.principalOutstanding <= 0) {
      loan.principalOutstanding = 0;
      loan.status = "paid";
    }

    await loan.save();

    return new Response(JSON.stringify(repayment), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
