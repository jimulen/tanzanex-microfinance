"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Transaction {
  _id: string;
  type: "inflow" | "outflow";
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface TodaySummary {
  inflows: number;
  outflows: number;
  net: number;
  count: number;
}

export default function TodayTransactions() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchTodayTransactions();
    
    // Add periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTodayTransactions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTodayTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await fetch("/api/dashboard/today-transactions", {
        cache: "no-store",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Today's transactions data:", data); // Debug log
        setTransactions(data.transactions);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch today's transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/cashflow", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        
        // Calculate summary for all transactions
        const inflows = data
          .filter((t: Transaction) => t.type === "inflow")
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
          
        const outflows = data
          .filter((t: Transaction) => t.type === "outflow")
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        setSummary({
          inflows,
          outflows,
          net: inflows - outflows,
          count: data.length
        });
      }
    } catch (error) {
      console.error("Failed to fetch all transactions:", error);
    }
  };

  const toggleView = () => {
    if (showAll) {
      fetchTodayTransactions();
      setShowAll(false);
    } else {
      fetchAllTransactions();
      setShowAll(true);
    }
  };

  const formatMoney = (value: number) =>
    `TZS ${Number(value || 0).toLocaleString()}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Today's Transactions</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">
          {showAll ? "All Transactions" : "Today's Transactions"}
        </h3>
        <button
          onClick={toggleView}
          className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showAll ? "Show Today" : "Show All"}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Inflows</p>
            <p className="text-lg font-bold text-green-600">
              {formatMoney(summary.inflows)}
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-gray-600">Outflows</p>
            <p className="text-lg font-bold text-red-600">
              {formatMoney(summary.outflows)}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">Net</p>
            <p className={`text-lg font-bold ${summary.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatMoney(summary.net)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {showAll ? "No transactions found" : "No transactions today"}
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction._id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                transaction.type === "inflow" 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  transaction.type === "inflow" ? "text-green-600" : "text-red-600"
                }`}>
                  {transaction.type === "inflow" ? "+" : "-"}
                  {formatMoney(transaction.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
