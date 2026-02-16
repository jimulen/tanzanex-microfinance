"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  month: string;
  loans: number;
  repayments: number;
}

export default function LoansVsRepayment() {
  const [data, setData] = useState<ChartData[]>([]);

  const fetchData = async () => {
    const res = await fetch("/api/dashboard/loans-repayments", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full h-80 bg-white shadow rounded p-4">
      <h2 className="font-bold mb-2">Loans vs Repayments</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="loans" stroke="#1E40AF" />
          <Line type="monotone" dataKey="repayments" stroke="#16A34A" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
