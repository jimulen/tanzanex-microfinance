"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleReset = async () => {
        if (confirmText !== "RESET") return;

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/system/reset", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                alert("System Reset Complete! All data has been cleared.");
                router.push("/dashboard");
            } else {
                const err = await res.json();
                alert(`Reset Failed: ${err.message}`);
            }
        } catch (error) {
            console.error("Reset failed:", error);
            alert("A network error occurred during reset.");
        } finally {
            setLoading(false);
            setShowModal(false);
            setConfirmText("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header>
                        <h1 className="text-3xl font-bold text-gray-900">{t("systemSettings")}</h1>
                        <p className="text-gray-500">{t("maintenance")}</p>
                    </header>

                    {/* Language & Theme Section */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">{t("language")} & {t("theme")}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("selectLanguage")}</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setLanguage("en")}
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${language === "en" ? "bg-secondary text-white shadow-lg scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                    >
                                        {t("english")}
                                    </button>
                                    <button
                                        onClick={() => setLanguage("sw")}
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${language === "sw" ? "bg-secondary text-white shadow-lg scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                    >
                                        {t("kiswahili")}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("theme")}</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${theme === "light" ? "bg-primary text-white shadow-lg scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                    >
                                        ☀️ {t("lightMode")}
                                    </button>
                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${theme === "dark" ? "bg-primary text-white shadow-lg scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                    >
                                        🌙 {t("darkMode")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* General Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Information</h3>
                        <p className="text-gray-600 text-sm">Your admin account is secured with role-based access control.</p>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 p-8 rounded-xl border border-red-200 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className="text-xl font-bold uppercase tracking-wide">{t("dangerZone")}</h2>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-red-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{t("masterReset")}</h3>
                                <p className="text-gray-600 text-sm mt-1 max-w-md">
                                    Delete all borrowers, loans, repayments, and financial records. This action is **permanent** and cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg shrink-0"
                            >
                                {t("masterReset")}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Confirmation Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all duration-300">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-red-600 animate-in fade-in zoom-in duration-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Are you absolutely sure?</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                This will wipe **EVERYTHING** from the database except your Admin login. Please type <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">RESET</span> below to confirm this irreversible action.
                            </p>

                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type RESET here"
                                className="w-full p-4 border-2 border-gray-200 rounded-xl mb-6 focus:border-red-500 focus:ring-0 transition-colors uppercase font-mono text-center tracking-widest text-lg"
                            />

                            <div className="flex gap-4">
                                <button
                                    disabled={confirmText !== "RESET" || loading}
                                    onClick={handleReset}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Resetting..." : "Wipe All Data"}
                                </button>
                                <button
                                    onClick={() => { setShowModal(false); setConfirmText(""); }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
