"use client";

import { useEffect, useState } from "react";

interface Loan {
    _id: string;
    borrower: {
        fullName: string;
    };
    amountLoaned: number;
    interestAmount: number;
    totalAmount: number;
    paidAmount: number;
    principalOutstanding: number;
    status: string;
    createdAt: string;
}

interface ReportProps {
    startDate: string;
    endDate: string;
}

export default function LoansReport({ startDate, endDate }: ReportProps) {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/loans", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setLoans(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch loans:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = [...loans];
        if (startDate) {
            filtered = filtered.filter(l => new Date(l.createdAt) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(l => new Date(l.createdAt) <= end);
        }
        setFilteredLoans(filtered);
    }, [startDate, endDate, loans]);

    const formatMoney = (val: number) => `TZS ${Number(val || 0).toLocaleString()}`;

    const handlePrint = () => window.print();

    const handleDownloadCSV = () => {
        const headers = ["Borrower", "Principal", "Interest Amount", "Total Amount", "Paid", "Outstanding", "Status", "Date"];
        const rows = filteredLoans.map(loan => [
            loan.borrower?.fullName || "N/A",
            loan.amountLoaned,
            loan.interestAmount,
            loan.totalAmount,
            loan.paidAmount,
            loan.principalOutstanding,
            loan.status,
            new Date(loan.createdAt).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `loans_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-4 text-gray-500">Loading loans report...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-xl font-bold text-gray-800">Loans Report</h2>
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
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Principal</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total + Interest</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Paid</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Outstanding</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLoans.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 italic">
                                    No loans found.
                                </td>
                            </tr>
                        ) : (
                            filteredLoans.map((loan) => (
                                <tr key={loan._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{loan.borrower?.fullName || "N/A"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatMoney(loan.amountLoaned)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatMoney(loan.totalAmount)}</td>
                                    <td className="px-6 py-4 text-sm text-green-600 font-medium">{formatMoney(loan.paidAmount)}</td>
                                    <td className="px-6 py-4 text-sm text-red-600 font-medium">{formatMoney(loan.principalOutstanding)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${loan.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            loan.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(loan.createdAt).toLocaleDateString()}
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
