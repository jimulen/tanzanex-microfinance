"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RepaymentsPage() {
  const router = useRouter();
  const [repayments, setRepayments] = useState<any[]>([]);

  const loadRepayments = async () => {
    const res = await fetch("/api/repayments", { cache: "no-store" });
    setRepayments(await res.json());
  };

  useEffect(() => {
    loadRepayments();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Repayments</h1>
        <button
          onClick={() => router.push("/dashboard/repayments/add")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add Repayment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow-md bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Borrower</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Loan Balance</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map(r => (
              <tr key={r._id} className="border-b hover:bg-green-50 transition">
                <td className="py-2 px-4 text-black">{r.loan?.borrower?.fullName}</td>
                <td className="py-2 px-4 text-black">{r.amountPaid || r.amount}</td>
                <td className="py-2 px-4 text-black">{new Date(r.paidAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 text-black">{r.loan?.principalOutstanding}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
