"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function RepaymentsPage() {
  const router = useRouter();
  const [repayments, setRepayments] = useState<any[]>([]);
  const [role, setRole] = useState<string>("");

  const loadRepayments = async () => {
    const res = await fetch("/api/repayments", {
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    setRepayments(await res.json());
  };

  useEffect(() => {
    loadRepayments();

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">Repayments</h1>
        <button
          onClick={() => router.push("/dashboard/repayments/add")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          Add Repayment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Borrower</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Loan Balance</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map(r => (
              <tr key={r._id} className="border-b dark:border-gray-800 hover:bg-green-50 dark:hover:bg-green-900/10 transition">
                <td className="py-2 px-4 text-black dark:text-white">{r.loan?.borrower?.fullName || "Unknown"}</td>
                <td className="py-2 px-4 text-black dark:text-white">TZS {(r.amountPaid ?? r.amount ?? 0).toLocaleString()}</td>
                <td className="py-2 px-4 text-black dark:text-white">{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : "N/A"}</td>
                <td className="py-2 px-4 text-black dark:text-white font-medium text-red-600 dark:text-red-400">TZS {(r.loan?.principalOutstanding ?? 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
