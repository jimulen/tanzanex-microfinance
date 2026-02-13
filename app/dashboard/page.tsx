"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LoansVsRepayment from "./charts/LoansVsRepayment";

type DashboardMetrics = {
  totalLoans: number;
  activeLoans: number;
  outstandingBalance: number;
  totalRepaid: number;
  totalExpenses: number;
  netProfit: number;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/metrics", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => setMetrics(null));
  }, []);

  const formatMoney = (value: number) =>
    `TZS ${Number(value || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <div className="flex">
    

        <main className="flex-1 p-8 space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary">Overview</h2>
              <p className="text-sm text-gray-500">
                High-level snapshot of loans, repayments and expenses.
              </p>
            </div>
          </header>

          {/* Loan / portfolio KPIs */}
          <section className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary">
              <h3 className="text-gray-500">Total Loans</h3>
              <p className="mt-2 text-2xl font-bold text-primary">
                {metrics?.totalLoans ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                All loans ever created.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-secondary">
              <h3 className="text-gray-500">Active Loans</h3>
              <p className="mt-2 text-2xl font-bold text-secondary">
                {metrics?.activeLoans ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Loans that are not fully paid.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-accent">
              <h3 className="text-gray-500">Outstanding Balance</h3>
              <p className="mt-2 text-2xl font-bold text-accent">
                {formatMoney(metrics?.outstandingBalance ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Principal still to be collected.
              </p>
            </div>
          </section>

          {/* Financial KPIs */}
          <section className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary">
              <h3 className="text-gray-500">Total Repaid</h3>
              <p className="mt-2 text-2xl font-bold text-primary">
                {formatMoney(metrics?.totalRepaid ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Sum of all repayments.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-secondary">
              <h3 className="text-gray-500">Expenses</h3>
              <p className="mt-2 text-2xl font-bold text-secondary">
                {formatMoney(metrics?.totalExpenses ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Operational costs recorded.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-accent">
              <h3 className="text-gray-500">Net Profit</h3>
              <p className="mt-2 text-2xl font-bold text-accent">
                {formatMoney(metrics?.netProfit ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Total repaid minus expenses.
              </p>
            </div>
          </section>

          {/* Chart + quick links */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LoansVsRepayment />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              <p className="text-xs text-gray-500">
                Common actions you'll use daily.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  href="/dashboard/borrowers/add"
                  className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                >
                  <span>+ Register new borrower</span>
                  <span className="text-xs text-gray-400">Shift + B</span>
                </Link>
                <Link
                  href="/dashboard/loans/add"
                  className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                >
                  <span>+ Create new loan</span>
                  <span className="text-xs text-gray-400">Shift + L</span>
                </Link>
                <Link
                  href="/dashboard/repayments/add"
                  className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                >
                  <span>+ Record repayment</span>
                  <span className="text-xs text-gray-400">Shift + R</span>
                </Link>
                <Link
                  href="/dashboard/loans"
                  className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                >
                  <span>View overdue loans</span>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
