"use client";

import { useState } from "react";

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

interface MetricsReportProps {
  data: ReportData;
  formatMoney: (value: number) => string;
}

export default function MetricsReport({ data, formatMoney }: MetricsReportProps) {
  const [viewMode, setViewMode] = useState<"summary" | "daily" | "monthly">("summary");

  const periodLabel = data.period === "monthly" 
    ? `${new Date(data.year, data.month! - 1, 1).toLocaleString('default', { month: 'long' })} ${data.year}`
    : `Year ${data.year}`;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {periodLabel} Metrics Report
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("summary")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === "summary"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode("daily")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === "daily"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Daily Breakdown
          </button>
          {data.monthlyData && (
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Monthly Breakdown
            </button>
          )}
        </div>
      </div>

      {viewMode === "summary" && (
        <div className="space-y-6">
          {/* Loan Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Loan Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Loans:</span>
                  <span className="font-semibold">{data.summary.totalLoans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Loans:</span>
                  <span className="font-semibold">{data.summary.activeLoans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Loan Amount:</span>
                  <span className="font-semibold">{formatMoney(data.summary.totalLoanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding Balance:</span>
                  <span className="font-semibold">{formatMoney(data.summary.outstandingBalance)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Revenue Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Repaid:</span>
                  <span className="font-semibold">{formatMoney(data.summary.totalRepaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className="font-semibold text-green-600">{formatMoney(data.summary.netProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Cash:</span>
                  <span className="font-semibold text-green-600">{formatMoney(data.summary.availableCash)}</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Expense Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expenses:</span>
                  <span className="font-semibold text-red-600">{formatMoney(data.summary.totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Inflow:</span>
                  <span className="font-semibold">{formatMoney(data.summary.totalInflow)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Outflow:</span>
                  <span className="font-semibold text-red-600">{formatMoney(data.summary.totalOutflow)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Cash Flow:</span>
                  <span className={`font-semibold ${data.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(data.summary.netCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.summary.totalLoans > 0 ? Math.round((data.summary.activeLoans / data.summary.totalLoans) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Active Loan Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.summary.totalLoanAmount > 0 ? Math.round((data.summary.totalRepaid / data.summary.totalLoanAmount) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Repayment Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.summary.totalLoans > 0 ? formatMoney(data.summary.totalLoanAmount / data.summary.totalLoans) : formatMoney(0)}
                </div>
                <div className="text-sm text-gray-600">Average Loan Size</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.summary.totalLoanAmount > 0 ? Math.round((data.summary.netProfit / data.summary.totalLoanAmount) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Profit Margin</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "daily" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200">Date</th>
                <th className="text-right p-3 border border-gray-200">Loans</th>
                <th className="text-right p-3 border border-gray-200">Loan Amount</th>
                <th className="text-right p-3 border border-gray-200">Repayments</th>
                <th className="text-right p-3 border border-gray-200">Expenses</th>
                <th className="text-right p-3 border border-gray-200">Inflow</th>
                <th className="text-right p-3 border border-gray-200">Outflow</th>
                <th className="text-right p-3 border border-gray-200">Net Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {data.dailyData.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">{day.date}</td>
                  <td className="text-right p-3 border border-gray-200">{day.loans}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(day.loanAmount)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(day.repayments)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(day.expenses)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(day.inflow)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(day.outflow)}</td>
                  <td className={`text-right p-3 border border-gray-200 font-semibold ${(day.inflow - day.outflow) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(day.inflow - day.outflow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "monthly" && data.monthlyData && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200">Month</th>
                <th className="text-right p-3 border border-gray-200">Loans</th>
                <th className="text-right p-3 border border-gray-200">Loan Amount</th>
                <th className="text-right p-3 border border-gray-200">Repayments</th>
                <th className="text-right p-3 border border-gray-200">Expenses</th>
                <th className="text-right p-3 border border-gray-200">Inflow</th>
                <th className="text-right p-3 border border-gray-200">Outflow</th>
                <th className="text-right p-3 border border-gray-200">Net Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyData.map((month, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">{month.monthName}</td>
                  <td className="text-right p-3 border border-gray-200">{month.loans}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(month.loanAmount)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(month.repayments)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(month.expenses)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(month.inflow)}</td>
                  <td className="text-right p-3 border border-gray-200">{formatMoney(month.outflow)}</td>
                  <td className={`text-right p-3 border border-gray-200 font-semibold ${(month.inflow - month.outflow) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(month.inflow - month.outflow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
