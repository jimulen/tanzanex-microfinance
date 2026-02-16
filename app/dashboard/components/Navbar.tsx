"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-secondary text-white px-6 py-4 flex justify-between">
      <h1 className="text-xl font-bold text-white uppercase tracking-wider">Tanzanex System</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg font-semibold transition shadow-sm"
      >
        {t("logout")}
      </button>
    </nav>
  );
}
