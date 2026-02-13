"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarLink {
  href: string;
  label: string;
  allowedRoles: string[];
}

const links: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/borrowers", label: "Borrowers", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/loans", label: "Loans", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/repayments", label: "Repayments", allowedRoles: ["admin", "manager", "staff", "officer"] },
  { href: "/dashboard/expenses", label: "Expenses", allowedRoles: ["admin", "manager"] },
  { href: "/dashboard/staff", label: "Staff Management", allowedRoles: ["admin"] },
  { href: "/dashboard/reports", label: "Reports", allowedRoles: ["admin", "manager"] },
];

export default function Sidebar() {
  const pathname = usePathname();
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
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  }, []);

  return (
    <aside className="bg-secondary text-white w-64 min-h-screen p-6 flex flex-col gap-6">
      <div className="text-xl font-semibold tracking-tight">Dashboard</div>
      <div className="text-xs text-gray-400 -mt-4 uppercase">{role || "Loading..."}</div>

      <nav className="space-y-1 text-sm font-medium">
        {links.map((link) => {
          // If no role is set yet, hide everything or show nothing? 
          // Better to show nothing until role is loaded or if role is invalid.
          if (!role || !link.allowedRoles.includes(role)) return null;

          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-white/90 hover:bg-white/10 hover:text-white transition-colors ${active ? "bg-white text-secondary" : ""
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
