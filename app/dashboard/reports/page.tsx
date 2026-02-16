"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import BorrowersReport from "./BorrowersReport";
import LoansReport from "./LoansReport";
import RepaymentsReport from "./RepaymentsReport";
import ExpensesReport from "./ExpensesReport";
import ProfitReport from "./ProfitReport";
import CashFlowReport from "./CashFlowReport";

type ReportType = "borrowers" | "loans" | "repayments" | "expenses" | "profit" | "cashflow";

export default function ReportsPage() {
    const [activeReport, setActiveReport] = useState<ReportType>("borrowers");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const tabs: { id: ReportType; label: string }[] = [
        { id: "borrowers", label: "Borrowers" },
        { id: "loans", label: "Loans" },
        { id: "repayments", label: "Repayments" },
        { id: "expenses", label: "Expenses" },
        { id: "cashflow", label: "Cash Flow" },
        { id: "profit", label: "Profit & Loss" },
    ];

    return (
        <div className="p-8 space-y-8">
            <Navbar />
            <header className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-secondary">System Reports</h1>
                    <p className="text-gray-500 mt-2">Generate and view detailed reports for the microfinance system.</p>
                </div>

                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-end transition-colors">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setStartDate(""); setEndDate(""); }}
                        className="text-xs text-secondary hover:text-primary font-medium py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 no-print">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveReport(tab.id)}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeReport === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Report Content */}
            <section className="animate-in fade-in duration-500">
                {activeReport === "borrowers" && <BorrowersReport startDate={startDate} endDate={endDate} />}
                {activeReport === "loans" && <LoansReport startDate={startDate} endDate={endDate} />}
                {activeReport === "repayments" && <RepaymentsReport startDate={startDate} endDate={endDate} />}
                {activeReport === "expenses" && <ExpensesReport startDate={startDate} endDate={endDate} />}
                {activeReport === "cashflow" && <CashFlowReport startDate={startDate} endDate={endDate} />}
                {activeReport === "profit" && <ProfitReport startDate={startDate} endDate={endDate} />}
            </section>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                    }
                    aside {
                        display: none !important;
                    }
                    nav {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
