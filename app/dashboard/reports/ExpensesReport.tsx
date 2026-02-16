"use client";

import { useEffect, useState } from "react";

interface Expense {
    _id: string;
    title: string;
    amount: number;
    category: string;
    expenseDate: string;
}

interface ReportProps {
    startDate: string;
    endDate: string;
}

export default function ExpensesReport({ startDate, endDate }: ReportProps) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/expenses", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setExpenses(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch expenses:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = [...expenses];
        if (startDate) {
            filtered = filtered.filter(e => new Date(e.expenseDate) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(e => new Date(e.expenseDate) <= end);
        }
        setFilteredExpenses(filtered);
    }, [startDate, endDate, expenses]);

    const formatMoney = (val: number) => `TZS ${Number(val || 0).toLocaleString()}`;

    const handlePrint = () => window.print();

    const handleDownloadCSV = () => {
        const headers = ["Title", "Category", "Amount", "Date"];
        const rows = filteredExpenses.map(e => [
            e.title,
            e.category || "General",
            e.amount,
            new Date(e.expenseDate).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `expenses_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-4 text-gray-500">Loading expenses report...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-xl font-bold text-gray-800">Expenses Report</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadCSV}
                        className="bg-white text-secondary border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download CSV
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Print Report
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredExpenses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">
                                    No expenses found.
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses.map((e) => (
                                <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{e.title}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase">
                                            {e.category || "General"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-red-600 font-bold">{formatMoney(e.amount)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(e.expenseDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {filteredExpenses.length > 0 && (
                        <tfoot className="bg-gray-50 font-bold border-t border-gray-100">
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-sm text-gray-800 text-right uppercase tracking-wider">Total Expenses</td>
                                <td className="px-6 py-4 text-sm text-red-600">
                                    {formatMoney(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
