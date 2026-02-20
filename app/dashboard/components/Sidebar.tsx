"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface SidebarLink {
  href: string;
  labelKey: "overview" | "borrowers" | "loans" | "repayments" | "cashFlow" | "expenses" | "staffManagement" | "reports" | "settings";
  allowedRoles: string[];
  icon: string;
}

const links: SidebarLink[] = [
  { href: "/dashboard", labelKey: "overview", allowedRoles: ["admin", "manager", "staff", "officer"], icon: "🏠" },
  { href: "/dashboard/borrowers", labelKey: "borrowers", allowedRoles: ["admin", "manager", "staff", "officer"], icon: "👥" },
  { href: "/dashboard/loans", labelKey: "loans", allowedRoles: ["admin", "manager", "staff", "officer"], icon: "💰" },
  { href: "/dashboard/repayments", labelKey: "repayments", allowedRoles: ["admin", "manager", "staff", "officer"], icon: "💳" },
  { href: "/dashboard/cashflow", labelKey: "cashFlow", allowedRoles: ["admin", "manager", "staff", "officer"], icon: "💵" },
  { href: "/dashboard/expenses", labelKey: "expenses", allowedRoles: ["admin", "manager"], icon: "📊" },
  { href: "/dashboard/staff", labelKey: "staffManagement", allowedRoles: ["admin"], icon: "👔" },
  { href: "/dashboard/reports", labelKey: "reports", allowedRoles: ["admin", "manager"], icon: "📋" },
  { href: "/dashboard/settings", labelKey: "settings", allowedRoles: ["admin"], icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [role, setRole] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`bg-secondary dark:bg-gray-900 text-white min-h-screen p-6 flex flex-col gap-6 border-r dark:border-gray-800 transition-colors duration-300 ${
      isCollapsed ? "w-20" : "w-64"
    }`}>
      {/* Header with toggle button */}
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <div className="text-xl font-semibold tracking-tight">{t("dashboard")}</div>
            <div className="text-xs text-gray-400 -mt-1 uppercase">{role || "Loading..."}</div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 text-sm font-medium">
        {links.map((link) => {
          if (!role || !link.allowedRoles.includes(role)) return null;

          // Redirect Staff/Officer directly to Add Transaction for Cash Flow
          let href = link.href;
          if (link.labelKey === "cashFlow" && (role === "staff" || role === "officer")) {
            href = "/dashboard/cashflow/add";
          }

          const active =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={link.href}
              href={href}
              className={`flex items-center rounded-lg px-3 py-2 text-white/90 hover:bg-white/10 hover:text-white transition-colors ${
                active ? "bg-white text-secondary dark:bg-white dark:text-gray-900" : ""
              }`}
              title={isCollapsed ? t(link.labelKey) : ""}
            >
              <span className="text-lg min-w-[20px] text-center">{link.icon}</span>
              {!isCollapsed && (
                <span className="ml-3">{t(link.labelKey)}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
