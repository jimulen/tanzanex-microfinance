"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SuperAdminOrgsPage() {
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [secret, setSecret] = useState("tanzanex-super-secret-2026");
    const [msg, setMsg] = useState("");

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/organizations?secret=${secret}`);
            const data = await res.json();
            if (res.ok) {
                setOrgs(data);
            } else {
                setMsg(data.message || "Failed to fetch orgs");
            }
        } catch (err) {
            setMsg("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    const updateStatus = async (orgId: string, status: string) => {
        try {
            const res = await fetch("/api/admin/activate-org", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId, status, secret }),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg(`Success: ${data.message}`);
                fetchOrgs();
            } else {
                setMsg(data.message || "Failed to update");
            }
        } catch (err) {
            setMsg("Update failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tighter">
                        Super-Admin: Organization Management
                    </h1>
                    <div className="flex items-center space-x-4">
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="px-4 py-2 border rounded-lg text-sm"
                            placeholder="Admin Secret Key"
                        />
                        <button
                            onClick={fetchOrgs}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={async () => {
                                if (!confirm("This will link all data without an organization to 'Tanzanex Main'. Continue?")) return;
                                setLoading(true);
                                try {
                                    const res = await fetch(`/api/admin/migrate-legacy?secret=${secret}`);
                                    const data = await res.json();
                                    setMsg(data.message || "Migration Successful");
                                    fetchOrgs();
                                } catch (err) {
                                    setMsg("Migration Flow Error");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-bold"
                        >
                            Restore Legacy Data
                        </button>
                    </div>
                </div>

                {msg && (
                    <div className={`p-4 mb-6 rounded-lg font-medium text-center shadow-sm ${msg.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {msg}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orgs.map((org) => (
                                    <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{org.name}</div>
                                            <div className="text-xs text-gray-400">{org._id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${org.subscriptionStatus === "active" ? "bg-green-100 text-green-700" :
                                                org.subscriptionStatus === "trial" ? "bg-blue-100 text-blue-700" :
                                                    org.subscriptionStatus === "suspended" ? "bg-red-100 text-red-700" :
                                                        "bg-gray-100 text-gray-700"
                                                }`}>
                                                {org.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {org.expiryDate ? new Date(org.expiryDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() => updateStatus(org._id, "active")}
                                                className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                                            >
                                                Activate (1st Year)
                                            </button>
                                            <button
                                                onClick={() => updateStatus(org._id, "suspended")}
                                                className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                                            >
                                                Suspend
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orgs.length === 0 && (
                            <div className="p-12 text-center text-gray-500 italic">No organizations found.</div>
                        )}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-emerald-600 font-bold hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
