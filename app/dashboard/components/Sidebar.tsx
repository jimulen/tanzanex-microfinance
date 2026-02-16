"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface SidebarLink {
  href: string;
  labelKey: "overview" | "borrowers" | "loans" | "repayments" | "cashFlow" | "expenses" | "staffManagement" | "reports" | "settings";
  allowedRoles: string[];
}

const links: SidebarLink[] = [
  { href: "/dashboard", labelKey: "overview", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/borrowers", labelKey: "borrowers", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/loans", labelKey: "loans", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/repayments", labelKey: "repayments", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/cashflow", labelKey: "cashFlow", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/expenses", labelKey: "expenses", allowedRoles: ["admin", "manager"] },
  { href: "/dashboard/staff", labelKey: "staffManagement", allowedRoles: ["admin"] },
  { href: "/dashboard/reports", labelKey: "reports", allowedRoles: ["admin", "manager"] },
  { href: "/dashboard/settings", labelKey: "settings", allowedRoles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [role, setRole] = useState<string>("");

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

  return (
    <aside className="bg-secondary dark:bg-gray-900 text-white w-64 min-h-screen p-6 flex flex-col gap-6 border-r dark:border-gray-800 transition-colors">
      <div className="text-xl font-semibold tracking-tight">{t("dashboard")}</div>
      <div className="text-xs text-gray-400 -mt-4 uppercase">{role || "Loading..."}</div>

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
              className={`block rounded-lg px-3 py-2 text-white/90 hover:bg-white/10 hover:text-white transition-colors ${active ? "bg-white text-secondary dark:bg-white dark:text-gray-900" : ""
                }`}
            >
              {t(link.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
