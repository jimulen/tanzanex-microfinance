"use client";

import { useEffect, useState } from "react";

interface CashFlowTransaction {
    _id: string;
    type: "inflow" | "outflow";
    amount: number;
    description: string;
    category: string;
    date: string;
}

interface ReportProps {
    startDate: string;
    endDate: string;
}

export default function CashFlowReport({ startDate, endDate }: ReportProps) {
    const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, [startDate, endDate]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/cashflow", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            let data: CashFlowTransaction[] = await res.json();

            if (Array.isArray(data)) {
                if (startDate) {
                    data = data.filter(t => new Date(t.date) >= new Date(startDate));
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    data = data.filter(t => new Date(t.date) <= end);
                }
                setTransactions(data);
            }
        } catch (error) {
            console.error("Failed to fetch cash flow for report:", error);
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

    const downloadCSV = () => {
        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description,
            t.category,
            t.type.toUpperCase(),
            t.amount
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `CashFlow_Report_${startDate || 'all'}_to_${endDate || 'now'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="no-print flex justify-end gap-3">
                <button
                    onClick={downloadCSV}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition text-sm font-medium"
                >
                    Download CSV
                </button>
                <button
                    onClick={() => window.print()}
                    className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded shadow transition text-sm font-medium"
                >
                    Print Report
                </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase">Cash Flow Report</h2>
                    <p className="text-gray-500 mt-1">
                        Period: {startDate || "Beginning"} to {endDate || "Today"}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-10">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-widest">Total Inflow (Capital)</p>
                        <p className="text-xl font-bold text-green-800 mt-1">TZS {totalInflow.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Total Outflow</p>
                        <p className="text-xl font-bold text-red-800 mt-1">TZS {totalOutflow.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Net Cash Flow</p>
                        <p className="text-xl font-bold text-blue-800 mt-1">TZS {netCashFlow.toLocaleString()}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-tighter">
                                <th className="pb-3 px-2">Date</th>
                                <th className="pb-3 px-2">Description</th>
                                <th className="pb-3 px-2">Category</th>
                                <th className="pb-3 px-2">Type</th>
                                <th className="pb-3 px-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm italic py-2">
                            {loading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No data for this period.</td></tr>
                            ) : (
                                transactions.map(t => (
                                    <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-2 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-2 font-medium text-gray-800">{t.description}</td>
                                        <td className="py-3 px-2 text-gray-500">{t.category}</td>
                                        <td className="py-3 px-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.type === "inflow" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                                                }`}>
                                                {t.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className={`py-3 px-2 text-right font-bold ${t.type === "inflow" ? "text-green-600" : "text-red-600"}`}>
                                            {t.type === "inflow" ? "+" : "-"} {t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between text-xs text-gray-400 italic">
                    <p>Generated on: {new Date().toLocaleString()}</p>
                    <p className="font-bold uppercase tracking-widest text-gray-900">Tanzanex Microfinance</p>
                </div>
            </div>
        </div>
    );
}
