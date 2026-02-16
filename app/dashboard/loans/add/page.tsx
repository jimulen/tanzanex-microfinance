"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddLoanPage() {
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<any[]>([]);

  const [form, setForm] = useState({
    borrower: "",
    amountLoaned: "",
    interestRate: 20, // default 20%
    months: 1,        // default 1 month
  });

  useEffect(() => {
    fetch("/api/borrowers", {
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(setBorrowers);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/loans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Failed to add loan");
      return;
    }

    router.push("/dashboard/loans");
    router.refresh();
  };

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-xl font-bold mb-4">Add Loan</h1>

      <form onSubmit={submit} className="space-y-3">
        <select
          className="w-full border p-2"
          value={form.borrower}
          onChange={(e) => setForm({ ...form, borrower: e.target.value })}
          required
        >
          <option value="">Select Borrower</option>
          {borrowers.map(b => (
            <option key={b._id} value={b._id}>
              {b.fullName}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          className="w-full border p-2"
          value={form.amountLoaned}
          onChange={(e) =>
            setForm({ ...form, amountLoaned: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Interest Rate (%)"
          className="w-full border p-2"
          value={form.interestRate}
          onChange={(e) =>
            setForm({ ...form, interestRate: Number(e.target.value) })
          }
        />

        <input
          type="number"
          placeholder="Duration (months)"
          className="w-full border p-2"
          value={form.months}
          onChange={(e) =>
            setForm({ ...form, months: Number(e.target.value) })
          }
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Save Loan
        </button>
      </form>
    </div>
  );
}
