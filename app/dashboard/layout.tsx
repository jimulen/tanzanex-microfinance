"use client";
import Sidebar from "./components/Sidebar";
import SubscriptionExpired from "./components/SubscriptionExpired";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [subscription, setSubscription] = useState<{ isLocked: boolean; reason?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
      // Check subscription status
      fetch("/api/subscription/status", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setSubscription(data))
        .catch(() => setSubscription({ isLocked: false })); // Default to not locked if api fails (or handle error)
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (subscription?.isLocked) {
    return <SubscriptionExpired reason={subscription.reason || ""} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-auto transition-all duration-300">{children}</main>
    </div>
  );
}
