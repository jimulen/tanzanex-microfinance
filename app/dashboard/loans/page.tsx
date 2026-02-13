"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetch("/api/loans")
      .then(res => res.json())
      .then(data => setLoans(data));
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Loans
        </h1>

        <Link
          href="/dashboard/loans/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium"
        >
          + Add Loan
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Borrower</th>
              <th className="p-3 text-right">Amount Loaned</th>
              <th className="p-3 text-right">Interest</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Paid</th>
              <th className="p-3 text-right">Outstanding</th>
            </tr>
          </thead>

          <tbody>
            {loans.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No loans found
                </td>
              </tr>
            )}

            {loans.map((loan) => (
              <tr
                key={loan._id}
                className="border-t hover:bg-gray-50 text-sm"
              >
                <td className="p-3 font-semibold text-gray-800">
                  {loan.borrower?.fullName || "N/A"}
                </td>

                <td className="p-3 text-right">
                  {formatMoney(loan.amountLoaned)}
                </td>

                <td className="p-3 text-right text-blue-600 font-medium">
                  {formatMoney(loan.interestAmount)}
                </td>

                <td className="p-3 text-right font-semibold text-green-600">
                  {formatMoney(loan.totalAmount)}
                </td>

                <td className="p-3 text-right text-gray-700">
                  {formatMoney(loan.paidAmount)}
                </td>

                <td className="p-3 text-right font-semibold text-red-600">
                  {formatMoney(loan.principalOutstanding)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Money formatter */
function formatMoney(value) {
  return `TZS ${Number(value || 0).toLocaleString()}`;
}
