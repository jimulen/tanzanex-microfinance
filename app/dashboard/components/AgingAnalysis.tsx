"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface AgingReport {
  customerId: string;
  customerName: string;
  loanId: string;
  dueDate: string;
  daysPastDue: number;
  amountDue: number;
  status: 'near_deadline' | 'overdue' | 'severely_overdue';
}

interface ExpectedCollection {
  customerId: string;
  customerName: string;
  expectedAmount: number;
  loanId: string;
  nextPaymentDate: string;
}

interface AgingData {
  nearDeadline: AgingReport[];
  overdue: AgingReport[];
  severelyOverdue: AgingReport[];
  total: number;
  totalAmount: number;
}

interface ExpectedCollectionsData {
  today: ExpectedCollection[];
  upcoming: ExpectedCollection[];
  totalExpected: number;
}

export default function AgingAnalysis() {
  const { t } = useLanguage();
  const [agingData, setAgingData] = useState<AgingData | null>(null);
  const [expectedCollections, setExpectedCollections] = useState<ExpectedCollectionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgingData();
  }, []);

  const fetchAgingData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/dashboard/aging", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgingData(data.aging);
        setExpectedCollections(data.expectedCollections);
      }
    } catch (error) {
      console.error("Failed to fetch aging data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) =>
    `TZS ${Number(value || 0).toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'near_deadline': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overdue': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'severely_overdue': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'near_deadline': return 'Near Deadline';
      case 'overdue': return 'Overdue';
      case 'severely_overdue': return 'Severely Overdue';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Aging Analysis</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aging Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Aging Analysis</h3>
          <div className="text-sm text-gray-500">
            Customers with outstanding payments
          </div>
        </div>

        {agingData && agingData.total > 0 ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600">Near Deadline (≤5 days)</p>
                <p className="text-lg font-bold text-yellow-600">{agingData.nearDeadline.length}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600">Overdue (6-30 days)</p>
                <p className="text-lg font-bold text-orange-600">{agingData.overdue.length}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-gray-600">Severely Overdue (&gt;30 days)</p>
                <p className="text-lg font-bold text-red-600">{agingData.severelyOverdue.length}</p>
              </div>
            </div>

            {/* Detailed List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...agingData.nearDeadline, ...agingData.overdue, ...agingData.severelyOverdue]
                .slice(0, 10) // Show top 10 most overdue
                .map((customer) => (
                  <div
                    key={customer.loanId}
                    className={`p-3 rounded-lg border ${getStatusColor(customer.status)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{customer.customerName}</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(customer.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatMoney(customer.amountDue)}</p>
                        <p className="text-xs">
                          {customer.daysPastDue > 0 ? `${customer.daysPastDue} days past due` : 'Due today'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No overdue payments at this time
          </div>
        )}
      </div>

      {/* Expected Collections */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Expected Collections</h3>
          <div className="text-sm text-gray-500">
            Today's expected payments
          </div>
        </div>

        {expectedCollections && expectedCollections.today.length > 0 ? (
          <>
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Total Expected Today</p>
              <p className="text-xl font-bold text-green-600">
                {formatMoney(expectedCollections.totalExpected)}
              </p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {expectedCollections.today.map((collection) => (
                <div
                  key={collection.loanId}
                  className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div>
                    <p className="font-medium text-gray-800">{collection.customerName}</p>
                    <p className="text-xs text-gray-500">Loan ID: {collection.loanId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatMoney(collection.expectedAmount)}
                    </p>
                    <p className="text-xs text-gray-500">Expected today</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No collections expected for today
          </div>
        )}
      </div>
    </div>
  );
}
