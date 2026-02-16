"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("");

  const loadBorrowers = async () => {
    setLoading(true);

    const res = await fetch("/api/borrowers", {
      cache: "no-store", // 🔥 CRITICAL
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    setBorrowers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadBorrowers();

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
        <h1 className="text-2xl font-bold text-black dark:text-white">Borrowers</h1>

        <Link
          href="/dashboard/borrowers/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm transition"
        >
          + Add Borrower
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : borrowers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No borrowers found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="p-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="p-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">NIDA</th>
                <th className="p-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {borrowers.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{b.fullName || b.name}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{b.phone}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    {b.nationalId || b.nida || b.NIDA || b.nationalID}
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{b.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
