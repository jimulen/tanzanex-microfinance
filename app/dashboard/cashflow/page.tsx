"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

interface CashFlowTransaction {
    _id: string;
    type: "inflow" | "outflow";
    amount: number;
    description: string;
    category: string;
    date: string;
}

export default function CashFlowPage() {
    const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userRole = payload.role || "staff";
                setRole(userRole);

                // Redirect staff/officer as they shouldn't see the results
                if (userRole === "staff" || userRole === "officer") {
                    window.location.href = "/dashboard/cashflow/add";
                    return;
                }
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("/api/cashflow", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            setTransactions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch cash flow:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalInflow = transactions
        .filter(t => t.type === "inflow")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = transactions
        .filter(t => t.type === "outflow")
        .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalInflow - totalOutflow;

    // Derived from transactions for now, or you could fetch from metrics
    const availableCash = netCashFlow; // Simple logic
    const totalExpenses = transactions
        .filter(t => t.type === "outflow")
        .reduce((sum, t) => sum + t.amount, 0);

    const canRecord = !!role;

    return (
        <div className="p-8 space-y-8">
            <Navbar />
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cash Flow</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monitor and manage the system's capital and liquidity.</p>
                </div>
                {canRecord && (
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard/cashflow/add"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-lg flex items-center gap-2"
                        >
                            <span>+ Record Transaction</span>
                        </Link>
                    </div>
                )}
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Capital</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">TZS {netCashFlow.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full w-fit">
                        Total Inflow - Total Outflow
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Liquidity</p>
                    <h3 className="text-3xl font-bold text-blue-600">TZS {availableCash.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full w-fit">
                        Available for Lending
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Outflows</p>
                    <h3 className="text-3xl font-bold text-red-500">TZS {totalOutflow.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full w-fit">
                        Operational Expenses + Manual Outflows
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Loading transactions...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        No transactions recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tx.type === "inflow" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {tx.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {tx.description}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${tx.type === "inflow" ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {tx.type === "inflow" ? "+" : "-"} TZS {tx.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
