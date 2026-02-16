"use client";

import { useEffect, useState } from "react";

interface Borrower {
    _id: string;
    fullName: string;
    phone: string;
    nationalId: string;
    address: string;
    createdAt: string;
}

interface ReportProps {
    startDate: string;
    endDate: string;
}

export default function BorrowersReport({ startDate, endDate }: ReportProps) {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/borrowers", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setBorrowers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch borrowers:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = [...borrowers];
        if (startDate) {
            filtered = filtered.filter(b => new Date(b.createdAt) >= new Date(startDate));
        }
        if (endDate) {
            // End of the selected day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(b => new Date(b.createdAt) <= end);
        }
        setFilteredBorrowers(filtered);
    }, [startDate, endDate, borrowers]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadCSV = () => {
        const headers = ["Full Name", "Phone", "National ID", "Address", "Registered Date"];
        const rows = filteredBorrowers.map(b => [
            b.fullName,
            b.phone || "",
            b.nationalId || "",
            b.address || "",
            new Date(b.createdAt).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `borrowers_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-4 text-gray-500">Loading borrowers report...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Borrowers Report</h2>
                <div className="flex gap-2 no-print">
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
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Full Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Phone</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">National ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Address</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Registered Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredBorrowers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 italic">
                                    No borrowers found.
                                </td>
                            </tr>
                        ) : (
                            filteredBorrowers.map((b) => (
                                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{b.fullName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{b.phone || "-"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{b.nationalId || "-"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{b.address || "-"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(b.createdAt).toLocaleDateString()}
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
