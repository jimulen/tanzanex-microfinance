"use client";

import SuperAdmin from "../components/SuperAdmin";
import { useLanguage } from "@/context/LanguageContext";

export default function SuperAdminPage() {
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {t("superAdmin")}
        </h1>
        <p className="text-gray-600">
          Administrative control panel for system management
        </p>
      </div>
      
      <SuperAdmin />
    </div>
  );
}
