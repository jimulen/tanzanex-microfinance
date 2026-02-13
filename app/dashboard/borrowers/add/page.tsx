"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddBorrowerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    nationalId: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/borrowers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // also send `name` for compatibility with any legacy code
      body: JSON.stringify({ ...form, name: form.fullName }),
    });

    if (!res.ok) {
      alert("Failed to add borrower");
      return;
    }

    // 🔥 THIS IS THE MAGIC COMBO
    router.push("/dashboard/borrowers");
    router.refresh();
  };

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-xl font-bold mb-4">Add Borrower</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Full Name"
          className="w-full border p-2"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />

        <input
          placeholder="Phone"
          className="w-full border p-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          placeholder="National ID"
          className="w-full border p-2"
          value={form.nationalId}
          onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
        />

        <input
          placeholder="Address"
          className="w-full border p-2"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Save Borrower
        </button>
      </form>
    </div>
  );
}
