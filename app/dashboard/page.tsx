"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import TodayTransactions from "./components/TodayTransactions";
import AgingAnalysis from "./components/AgingAnalysis";
import LoansVsRepayment from "./charts/LoansVsRepayment";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardMetrics {
  todayLoans: number;
  todayActiveLoans: number;
  todayLoanAmount: number;
  todayRepaid: number;
  todayExpenses: number;
  operationalExpenses: number;
  manualOutflows: number;
  todayNetProfit: number;
  todayInflow: number;
  todayOutflow: number;
  todayNetCashFlow: number;
  todayAvailableCash: number;
  totalLoans: number;
  totalActiveLoans: number;
  totalOutstandingBalance: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchMetrics = () => {
      if (!token) return;
      
      fetch("/api/dashboard/metrics", {
        cache: "no-store",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Dashboard metrics updated:", data); // Debug log
          setMetrics(data);
        })
        .catch(() => setMetrics(null));
    };

    // Initial fetch
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);

    if (token) {
      try {
        const payload = JSON.parse(atob(token!.split('.')[1]));
        if (payload && payload.role) {
          setRole(payload.role);
        }
      } catch (error) {
        console.error("Token parsing error:", error);
      }
    }
  }, []);

  const formatMoney = (value: number) =>
    `TZS ${Number(value || 0).toLocaleString()}`;

  const isRestricted = role === "staff" || role === "officer";

  return (
    <>
      <Navbar />
      <div className="p-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary">{t("overview")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("snapshotMain")}
            </p>
          </div>
        </header>

        {/* Today's Loan / portfolio KPIs */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary">
            <h3 className="text-gray-500">Today's Loans</h3>
            <p className="mt-2 text-2xl font-bold text-primary">
              {metrics?.todayLoans ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Loans created today
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-secondary">
            <h3 className="text-gray-500">Today's Active Loans</h3>
            <p className="mt-2 text-2xl font-bold text-secondary">
              {metrics?.todayActiveLoans ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Active loans created today
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-accent">
            <h3 className="text-gray-500">Today's Loan Amount</h3>
            <p className="mt-2 text-2xl font-bold text-accent">
              {formatMoney(metrics?.todayLoanAmount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Total amount loaned today
            </p>
          </div>
        </section>

        {/* Today's Financial KPIs */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary">
            <h3 className="text-gray-500">Today's Repayments</h3>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatMoney(metrics?.todayRepaid ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Amount repaid today
            </p>
          </div>

          {!isRestricted && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
                <h3 className="text-gray-500">Today's Outflows</h3>
                <p className="mt-2 text-2xl font-bold text-red-500">
                  {formatMoney(metrics?.todayExpenses ?? 0)}
                </p>
                <div className="mt-1 flex flex-col gap-0.5">
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Operational: {formatMoney(metrics?.operationalExpenses || 0)}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Manual: {formatMoney(metrics?.manualOutflows || 0)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-600">
                <h3 className="text-gray-500">Today's Net Profit</h3>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {formatMoney(metrics?.todayNetProfit ?? 0)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Today's profit (repayments - expenses)
                </p>
              </div>
            </>
          )}
        </section>

        {/* Today's Cash Flow / Capital Section */}
        {!isRestricted && (
          <section className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <h3 className="text-gray-500">Today's Net Cash Flow</h3>
              <p className="mt-2 text-2xl font-bold text-blue-500">
                {formatMoney(metrics?.todayNetCashFlow ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Manual inflows - outflows today
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500 md:col-span-2">
              <h3 className="text-gray-500">Today's Available Cash</h3>
              <p className="mt-2 text-2xl font-bold text-orange-500">
                {formatMoney(metrics?.todayAvailableCash ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Today's net cash flow + net profit
              </p>
            </div>
          </section>
        )}

        {/* Overall Summary (smaller cards) */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-xs text-gray-600">Total Loans</h4>
            <p className="text-lg font-semibold text-gray-800">
              {metrics?.totalLoans ?? 0}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-xs text-gray-600">Total Active</h4>
            <p className="text-lg font-semibold text-gray-800">
              {metrics?.totalActiveLoans ?? 0}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-xs text-gray-600">Total Outstanding</h4>
            <p className="text-lg font-semibold text-gray-800">
              {formatMoney(metrics?.totalOutstandingBalance ?? 0)}
            </p>
          </div>
        </section>

        {/* Today's Transactions + Aging Analysis */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <TodayTransactions />
              <AgingAnalysis />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">{t("quickActions")}</h3>
            <p className="text-xs text-gray-500">
              {t("dailyActions")}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/dashboard/borrowers/add"
                className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <span>+ {t("registerBorrower")}</span>
                <span className="text-xs text-gray-400">Shift + B</span>
              </Link>
              <Link
                href="/dashboard/loans/add"
                className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <span>+ {t("createLoan")}</span>
                <span className="text-xs text-gray-400">Shift + L</span>
              </Link>
              <Link
                href="/dashboard/repayments/add"
                className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <span>+ {t("recordRepayment")}</span>
                <span className="text-xs text-gray-400">Shift + R</span>
              </Link>
              <Link
                href="/dashboard/loans"
                className="inline-flex items-center justify-between rounded-lg border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <span>{t("viewOverdue")}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
