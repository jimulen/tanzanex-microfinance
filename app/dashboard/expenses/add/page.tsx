"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddExpensePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");

  const submit = async () => {
    if (!title || amount <= 0) {
      alert("Fill all fields");
      return;
    }

    await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ title, amount, category }),
    });

    router.push("/dashboard/expenses");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-green-600 mb-6 text-center">Add New Expense</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title</label>
            <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              placeholder="e.g. Office Rent"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              placeholder="0.00"
              value={amount === 0 ? "" : amount}
              onChange={e => setAmount(+e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Salaries">Salaries</option>
              <option value="Supplies">Supplies</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition transform active:scale-95"
            >
              Save Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
