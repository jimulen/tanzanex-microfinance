import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Repayment from "@/models/Payment";
import { getRole, getOrgId } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

interface AgingReport {
  customerId: string;
  customerName: string;
  loanId: string;
  dueDate: string;
  daysPastDue: number;
  amountDue: number;
  status: 'near_deadline' | 'overdue' | 'severely_overdue';
}

interface ExpectedCollection {
  customerId: string;
  customerName: string;
  expectedAmount: number;
  loanId: string;
  nextPaymentDate: string;
}

/* GET aging analysis and expected collections */
export async function GET(req: Request) {
    const role = getRole(req);
    const orgId = getOrgId(req);

    if (!orgId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!role) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        // Get all active loans
        const activeLoans = await Loan.find({ 
            organization: orgId,
            status: { $in: ['active', 'approved'] }
        });

        const today = new Date();
        
        // Calculate aging for each loan
        const agingReport: AgingReport[] = [];
        const expectedCollections: ExpectedCollection[] = [];

        for (const loan of activeLoans) {
            const dueDate = new Date(loan.dueDate);
            const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Calculate remaining balance
            const repayments = await Repayment.find({ loanId: loan._id });
            const totalRepaid = repayments.reduce((sum: number, payment: any) => sum + (payment.amountPaid || 0), 0);
            const amountDue = loan.amount - totalRepaid;

            // Only include if there's still money owed
            if (amountDue > 0) {
                // Aging analysis
                if (daysPastDue >= 0) {
                    let status: 'near_deadline' | 'overdue' | 'severely_overdue';
                    
                    if (daysPastDue <= 5) {
                        status = 'near_deadline';
                    } else if (daysPastDue <= 30) {
                        status = 'overdue';
                    } else {
                        status = 'severely_overdue';
                    }

                    agingReport.push({
                        customerId: loan.borrowerId,
                        customerName: loan.borrowerName,
                        loanId: loan._id,
                        dueDate: loan.dueDate,
                        daysPastDue: Math.max(0, daysPastDue),
                        amountDue,
                        status
                    });
                }

                // Expected collections (payments due today or upcoming)
                const nextPaymentDate = new Date(loan.dueDate);
                if (nextPaymentDate <= today) {
                    expectedCollections.push({
                        customerId: loan.borrowerId,
                        customerName: loan.borrowerName,
                        expectedAmount: amountDue,
                        loanId: loan._id,
                        nextPaymentDate: loan.dueDate
                    });
                }
            }
        }

        // Sort aging report by days past due (most overdue first)
        agingReport.sort((a, b) => b.daysPastDue - a.daysPastDue);

        // Sort expected collections by amount (largest first)
        expectedCollections.sort((a, b) => b.expectedAmount - a.expectedAmount);

        return NextResponse.json({
            aging: {
                nearDeadline: agingReport.filter(a => a.status === 'near_deadline'),
                overdue: agingReport.filter(a => a.status === 'overdue'),
                severelyOverdue: agingReport.filter(a => a.status === 'severely_overdue'),
                total: agingReport.length,
                totalAmount: agingReport.reduce((sum, a) => sum + a.amountDue, 0)
            },
            expectedCollections: {
                today: expectedCollections.filter(c => {
                    const collectionDate = new Date(c.nextPaymentDate);
                    return collectionDate.toDateString() === today.toDateString();
                }),
                upcoming: expectedCollections.filter(c => {
                    const collectionDate = new Date(c.nextPaymentDate);
                    return collectionDate > today;
                }),
                totalExpected: expectedCollections.reduce((sum, c) => sum + c.expectedAmount, 0)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
