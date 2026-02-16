"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function AddCashFlowPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "inflow",
        amount: "",
        description: "",
        category: "Capital",
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("token");
        try {
            const res = await fetch("/api/cashflow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    amount: Number(formData.amount),
                }),
            });

            if (res.ok) {
                router.push("/dashboard/cashflow");
            } else {
                const err = await res.json();
                alert(`Error: ${err.message || "Failed to record transaction"}`);
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <Navbar />
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Record Cash Flow</h1>
                    <p className="text-gray-500 text-sm mt-1">Add a new capital inflow or withdrawal.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border border-gray-100 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Transaction Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                required
                            >
                                <option value="inflow">Inflow (Money Entering)</option>
                                <option value="outflow">Outflow (Money Withdrawal)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Amount (TZS)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Enter amount"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="e.g., Capital Injection, Owner Withdrawal"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition min-h-[100px]"
                            placeholder="Enter transaction details..."
                            required
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Recording..." : "Save Transaction"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
