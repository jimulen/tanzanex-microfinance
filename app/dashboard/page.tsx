"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import LoansVsRepayment from "./charts/LoansVsRepayment";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardMetrics {
  totalBorrowers: number;
  totalLoans: number;
  totalRepayments: number;
  totalExpenses: number;
  activeLoans: number;
  outstandingBalance: number;
  totalRepaid: number;
  operationalExpenses: number;
  manualOutflows: number;
  netProfit: number;
  netCashFlow: number;
  availableCash: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/dashboard/metrics", {
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => setMetrics(null));

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.role) {
          setRole(payload.role);
        }
      } catch (error) {
        console.error("Failed to decode token", error);
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

        {/* Loan / portfolio KPIs */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary">
            <h3 className="text-gray-500">{t("totalLoans")}</h3>
            <p className="mt-2 text-2xl font-bold text-primary">
              {metrics?.totalLoans ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {t("allLoansCreated")}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-secondary">
            <h3 className="text-gray-500">{t("activeLoans")}</h3>
            <p className="mt-2 text-2xl font-bold text-secondary">
              {metrics?.activeLoans ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {t("loansNotPaid")}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-accent">
            <h3 className="text-gray-500">{t("outstandingBalance")}</h3>
            <p className="mt-2 text-2xl font-bold text-accent">
              {formatMoney(metrics?.outstandingBalance ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {t("principalToCollect")}
            </p>
          </div>
        </section>

        {/* Financial KPIs */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary">
            <h3 className="text-gray-500">{t("totalRepaid")}</h3>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatMoney(metrics?.totalRepaid ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {t("sumRepayments")}
            </p>
          </div>

          {!isRestricted && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
                <h3 className="text-gray-500">{t("totalOutflows") || "Total Outflows"}</h3>
                <p className="mt-2 text-2xl font-bold text-red-500">
                  {formatMoney(metrics?.totalExpenses ?? 0)}
                </p>
                <div className="mt-1 flex flex-col gap-0.5">
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {t("operationalCosts")}: {formatMoney(metrics?.operationalExpenses || 0)}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {t("manualOutflows") || "Manual Outflows"}: {formatMoney(metrics?.manualOutflows || 0)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-600">
                <h3 className="text-gray-500">{t("netProfit")}</h3>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {formatMoney(metrics?.netProfit ?? 0)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {t("profitCalculation")}
                </p>
              </div>
            </>
          )}
        </section>

        {/* Cash Flow / Capital Section */}
        {!isRestricted && (
          <section className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <h3 className="text-gray-500">{t("netCapital")}</h3>
              <p className="mt-2 text-2xl font-bold text-blue-500">
                {formatMoney(metrics?.netCashFlow ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {t("capitalCalculation")}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500 md:col-span-2">
              <h3 className="text-gray-500">{t("availableLiquidity")}</h3>
              <p className="mt-2 text-2xl font-bold text-orange-500">
                {formatMoney(metrics?.availableCash ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {t("liquidityCalculation")}
              </p>
            </div>
          </section>
        )}

        {/* Chart + quick links */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LoansVsRepayment />
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
                className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
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
