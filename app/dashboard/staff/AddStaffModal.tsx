"use client";

import { useState } from "react";

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: () => void;
}

export default function AddStaffModal({ isOpen, onClose, onAdded }: AddStaffModalProps) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const submit = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to add staff");
            }

            onAdded();
            onClose();
            setForm({ name: "", email: "", password: "", role: "staff" });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-green-700">Add New Staff</h2>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="e.g. John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="john@tanzanex.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="********"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition flex items-center"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Create Staff"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
