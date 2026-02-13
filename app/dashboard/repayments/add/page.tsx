"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddRepaymentPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetch("/api/loans", { cache: "no-store" })
      .then(res => res.json())
      .then(setLoans);
  }, []);

  const submit = async () => {
    if (!loanId || !amount) return alert("Loan & amount required");

    await fetch("/api/repayments", {
      method: "POST",
      body: JSON.stringify({ loanId, amount: Number(amount) }),
    });

    router.push("/dashboard/repayments");
    router.refresh();
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-green-600">Add Repayment</h1>

      <div className="space-y-4">
        <select
          value={loanId}
          onChange={e => setLoanId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">Select Loan</option>
          {loans.map(l => (
            <option key={l._id} value={l._id}>
              {l.borrower?.fullName} — Balance: {l.balance}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <button
          onClick={submit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Save Repayment
        </button>
      </div>
    </div>
  );
}
