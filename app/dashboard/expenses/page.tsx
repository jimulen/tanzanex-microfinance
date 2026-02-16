"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch("/api/expenses", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(setExpenses);
  }, []);

  return (
    <div className="p-8 space-y-8">
      <Navbar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">Expenses</h1>
        <Link
          href="/dashboard/expenses/add"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          Add Expense
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow-md bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Title</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e: any) => (
              <tr key={e._id} className="border-b dark:border-gray-800 hover:bg-green-50 dark:hover:bg-green-900/10 transition">
                <td className="py-2 px-4 text-black dark:text-white font-medium">{e.title}</td>
                <td className="py-2 px-4">
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                    {e.category}
                  </span>
                </td>
                <td className="py-2 px-4 text-black dark:text-white font-bold text-red-600 dark:text-red-400">
                  TZS {Number(e.amount).toLocaleString()}
                </td>
                <td className="py-2 px-4 text-black dark:text-white">{new Date(e.expenseDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
