"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

interface Loan {
  _id: string;
  borrower: {
    fullName?: string;
  };
  amountLoaned: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  principalOutstanding: number;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    fetch("/api/loans", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => setLoans(Array.isArray(data) ? data : []));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.role) {
          setRole(payload.role);
        }
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }
  }, []);

  const isRestricted = role === "staff" || role === "officer";

  return (
    <div className="p-8 space-y-8">
      <Navbar />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Loans
        </h1>

        <Link
          href="/dashboard/loans/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium shadow-sm transition"
        >
          + Add Loan
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
            <tr>
              <th className="p-4 text-left font-bold uppercase tracking-wider text-xs">Borrower</th>
              <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Amount Loaned</th>
              <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Interest</th>
              <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Total</th>
              <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Paid</th>
              <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Outstanding</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No loans found
                </td>
              </tr>
            )}

            {loans.map((loan) => (
              <tr
                key={loan._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-sm"
              >
                <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">
                  {loan.borrower?.fullName || "N/A"}
                </td>

                <td className="p-4 text-right text-gray-700 dark:text-gray-300">
                  {formatMoney(loan.amountLoaned)}
                </td>

                <td className="p-4 text-right text-blue-600 dark:text-blue-400 font-medium">
                  {formatMoney(loan.interestAmount)}
                </td>

                <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">
                  {formatMoney(loan.totalAmount)}
                </td>

                <td className="p-4 text-right text-gray-700 dark:text-gray-300">
                  {formatMoney(loan.paidAmount)}
                </td>

                <td className="p-4 text-right font-bold text-red-600 dark:text-red-400">
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
function formatMoney(value: number) {
  return `TZS ${Number(value || 0).toLocaleString()}`;
}
