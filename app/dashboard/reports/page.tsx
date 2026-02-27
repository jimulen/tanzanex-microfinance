"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BorrowersReport from "./BorrowersReport";
import LoansReport from "./LoansReport";
import RepaymentsReport from "./RepaymentsReport";
import ExpensesReport from "./ExpensesReport";
import ProfitReport from "./ProfitReport";
import CashFlowReport from "./CashFlowReport";
import MetricsReport from "./MetricsReport";

type ReportType = "borrowers" | "loans" | "repayments" | "expenses" | "profit" | "cashflow" | "metrics";

interface ReportData {
  period: string;
  year: number;
  month?: number;
  summary: {
    totalLoans: number;
    activeLoans: number;
    totalLoanAmount: number;
    totalRepaid: number;
    totalExpenses: number;
    totalInflow: number;
    totalOutflow: number;
    netCashFlow: number;
    netProfit: number;
    availableCash: number;
    outstandingBalance: number;
  };
  dailyData: any[];
  monthlyData?: any[];
}

export default function ReportsPage() {
    const [activeReport, setActiveReport] = useState<ReportType>("metrics");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportPeriod, setReportPeriod] = useState<"monthly" | "yearly">("monthly");
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    console.log("REPORTS PAGE - State:", { activeReport, reportData, loading }); // Debug log

    const tabs: { id: ReportType; label: string }[] = [
        { id: "metrics", label: "Monthly/Yearly Metrics" },
        { id: "borrowers", label: "Borrowers" },
        { id: "loans", label: "Loans" },
        { id: "repayments", label: "Repayments" },
        { id: "expenses", label: "Expenses" },
        { id: "profit", label: "Profit" },
        { id: "cashflow", label: "Cash Flow" },
    ];

    useEffect(() => {
        if (activeReport === "metrics") {
            fetchReportData();
        }
    }, [activeReport, reportPeriod, reportYear, reportMonth]);

    const fetchReportData = async (shouldPrint = false) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                period: reportPeriod,
                year: reportYear.toString(),
            });

            if (reportPeriod === "monthly") {
                params.append("month", reportMonth.toString());
            }

            console.log("Fetching report with params:", params.toString()); // Debug log

            const response = await fetch(`/api/dashboard/reports?${params.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Report data received:", data); // Debug log
                setReportData(data);
                
                // Only print if explicitly requested
                if (shouldPrint) {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                }
            } else {
                console.error("Report API error:", response.status);
                setError(`Report API error: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            setError("Failed to fetch report data");
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (value: number) =>
        `TZS ${Number(value || 0).toLocaleString()}`;

    return (
        <>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-content, .print-content * {
                        visibility: visible;
                    }
                    .print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <Navbar />
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                        <p className="text-gray-600 mt-2">Generate and view various reports</p>
                    </div>
                </div>

                {/* Report Type Tabs */}
                <div className="flex space-x-1 mb-6 no-print">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveReport(tab.id)}
                            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                                activeReport === tab.id
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Metrics Report Controls */}
                {activeReport === "metrics" && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 no-print">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Period
                                </label>
                                <select
                                    value={reportPeriod}
                                    onChange={(e) => setReportPeriod(e.target.value as "monthly" | "yearly")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <select
                                    value={reportYear}
                                    onChange={(e) => setReportYear(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {reportPeriod === "monthly" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Month
                                    </label>
                                    <select
                                        value={reportMonth}
                                        onChange={(e) => setReportMonth(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                            <option key={month} value={month}>
                                                {new Date(reportYear, month - 1, 1).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <button
                                    onClick={() => fetchReportData(true)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? "Loading..." : "Print Report"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Content */}
                <div className="bg-white rounded-lg shadow-sm print-content">
                    {activeReport === "metrics" && (
                        reportData ? (
                            <MetricsReport data={reportData} formatMoney={formatMoney} />
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                <p>No report data available. Click "Generate Report" to create a report.</p>
                            </div>
                        )
                    )}
                    {activeReport === "borrowers" && <BorrowersReport startDate={startDate} endDate={endDate} />}
                    {activeReport === "loans" && <LoansReport startDate={startDate} endDate={endDate} />}
                    {activeReport === "repayments" && <RepaymentsReport startDate={startDate} endDate={endDate} />}
                    {activeReport === "expenses" && <ExpensesReport startDate={startDate} endDate={endDate} />}
                    {activeReport === "profit" && <ProfitReport startDate={startDate} endDate={endDate} />}
                    {activeReport === "cashflow" && <CashFlowReport startDate={startDate} endDate={endDate} />}
                </div>
            </div>
        </>
    );
}
