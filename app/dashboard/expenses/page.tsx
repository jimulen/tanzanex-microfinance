"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch("/api/expenses")
      .then(res => res.json())
      .then(setExpenses);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Expenses</h1>
        <Link
          href="/dashboard/expenses/add"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add Expense
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow-md bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Title</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Category</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e: any) => (
              <tr key={e._id} className="border-b hover:bg-green-50 transition">
                <td className="py-2 px-4 text-black">{e.title}</td>
                <td className="py-2 px-4 text-black">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {e.category}
                  </span>
                </td>
                <td className="py-2 px-4 text-black font-medium text-red-600">
                  {Number(e.amount).toLocaleString()}
                </td>
                <td className="py-2 px-4 text-black">{new Date(e.expenseDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
