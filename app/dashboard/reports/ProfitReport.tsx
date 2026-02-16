"use client";

import { useEffect, useState } from "react";

interface Repayment {
    _id: string;
    amountPaid: number;
    paidAt: string;
}

interface Expense {
    _id: string;
    title: string;
    amount: number;
    expenseDate: string;
}

interface ReportProps {
    startDate: string;
    endDate: string;
}

export default function ProfitReport({ startDate, endDate }: ReportProps) {
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const [repRes, expRes] = await Promise.all([
                    fetch("/api/repayments", { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch("/api/expenses", { headers: { "Authorization": `Bearer ${token}` } })
                ]);
                const repData = await repRes.json();
                const expData = await expRes.json();

                setRepayments(Array.isArray(repData) ? repData : []);
                setExpenses(Array.isArray(expData) ? expData : []);
            } catch (err) {
                console.error("Failed to fetch report data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to check if a date is within range
    const isWithinRange = (dateStr: any) => {
        if (!dateStr) return true; // If no date on record, include it
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return true; // If invalid date on record, include it

        if (startDate) {
            const start = new Date(startDate);
            if (!isNaN(start.getTime()) && date < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) {
                end.setHours(23, 59, 59, 999);
                if (date > end) return false;
            }
        }
        return true;
    };

    const filteredRepayments = repayments.filter(r => isWithinRange(r.paidAt));
    const filteredExpenses = expenses.filter(e => isWithinRange(e.expenseDate));

    const totalIncome = filteredRepayments.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    const formatMoney = (val: number) => `TZS ${Number(val || 0).toLocaleString()}`;

    const handlePrint = () => window.print();

    const handleDownloadCSV = () => {
        const headers = ["Category", "Total (TZS)"];
        const rows = [
            ["Total Income (Repayments)", totalIncome],
            ["Total Expenses", totalExpenses],
            ["Net Profit", netProfit]
        ];

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `profit_loss_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-4 text-gray-500">Loading Profit & Loss report...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-xl font-bold text-gray-800">Profit & Loss Statement</h2>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Income</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{formatMoney(totalIncome)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">{formatMoney(totalExpenses)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 bg-primary/5">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">Net Profit</p>
                    <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
                        {formatMoney(netProfit)}
                    </p>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mt-8">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Metric</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <tr>
                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">Income (Loan Repayments)</td>
                            <td className="px-6 py-4 text-sm text-green-600 font-bold text-right">{formatMoney(totalIncome)}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">Business Expenses</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-bold text-right">({formatMoney(totalExpenses)})</td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                            <td className="px-6 py-4 text-sm text-secondary uppercase tracking-wider">Net Profit / Loss</td>
                            <td className={`px-6 py-4 text-lg text-right ${netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
                                {formatMoney(netProfit)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="text-center text-xs text-gray-400 italic">
                Report generated for the period: {startDate || "Beginning"} to {endDate || "Today"}
            </div>
        </div>
    );
}
