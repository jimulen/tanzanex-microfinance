"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBorrowers = async () => {
    setLoading(true);

    const res = await fetch("/api/borrowers", {
      cache: "no-store", // 🔥 CRITICAL
    });

    const data = await res.json();
    setBorrowers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadBorrowers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Borrowers</h1>

        <Link
          href="/dashboard/borrowers/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Add Borrower
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : borrowers.length === 0 ? (
        <p className="text-gray-500">No borrowers found</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">NIDA</th>
              <th className="p-2 text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="p-2">{b.fullName || b.name}</td>
                <td className="p-2">{b.phone}</td>
                <td className="p-2">
                  {b.nationalId || b.nida || b.NIDA || b.nationalID}
                </td>
                <td className="p-2">{b.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
