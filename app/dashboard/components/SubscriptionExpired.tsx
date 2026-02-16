"use client";

import React from "react";

export default function SubscriptionExpired({ reason }: { reason: string }) {
    return (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Access Restricted
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
                {reason || "Your subscription has expired or your trial period has ended."}
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-left">
                    Contact System Owner
                </h2>
                <div className="space-y-3 text-left">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Phone:</strong> +255 7XX XXX XXX
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Email:</strong> support@tanzanex.com
                    </p>
                </div>
            </div>

            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
                I have paid, refresh system
            </button>

            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
                Log out
            </button>
        </div>
    );
}
