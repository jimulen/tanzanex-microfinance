"use client";

import { useEffect, useState } from "react";

interface Repayment {
    _id: string;
    loan: {
        _id: string;
        borrower: {
            fullName: string;
        };
    };
    amountPaid: number;
    paidAt: string;
}

interface ReportProps {
    startDate: string;
    endDate: string;
}

export default function RepaymentsReport({ startDate, endDate }: ReportProps) {
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [filteredRepayments, setFilteredRepayments] = useState<Repayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/repayments", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setRepayments(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch repayments:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = [...repayments];
        if (startDate) {
            filtered = filtered.filter(r => new Date(r.paidAt) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(r => new Date(r.paidAt) <= end);
        }
        setFilteredRepayments(filtered);
    }, [startDate, endDate, repayments]);

    const formatMoney = (val: number) => `TZS ${Number(val || 0).toLocaleString()}`;

    const handlePrint = () => window.print();

    const handleDownloadCSV = () => {
        const headers = ["Borrower", "Loan ID", "Amount Paid", "Date"];
        const rows = filteredRepayments.map(r => [
            r.loan?.borrower?.fullName || "N/A",
            r.loan?._id || "N/A",
            r.amountPaid,
            new Date(r.paidAt).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `repayments_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-4 text-gray-500">Loading repayments report...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-xl font-bold text-gray-800">Repayments Report</h2>
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
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Borrower</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Loan ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount Paid</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredRepayments.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">
                                    No repayments found.
                                </td>
                            </tr>
                        ) : (
                            filteredRepayments.map((r) => (
                                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{r.loan?.borrower?.fullName || "N/A"}</td>
                                    <td className="px-6 py-4 text-sm text-blue-600 break-all">{r.loan?._id || "N/A"}</td>
                                    <td className="px-6 py-4 text-sm text-green-600 font-bold">{formatMoney(r.amountPaid)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(r.paidAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
