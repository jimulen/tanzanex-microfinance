"use client";

import { useState, useEffect } from "react";

interface EditStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
    staff: any;
}

export default function EditStaffModal({ isOpen, onClose, onUpdated, staff }: EditStaffModalProps) {
    const [form, setForm] = useState({
        name: "",
        role: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (staff) {
            setForm({
                name: staff.name || "",
                role: staff.role || "staff",
                password: "", // Don't pre-fill password
            });
        }
    }, [staff]);

    if (!isOpen || !staff) return null;

    const submit = async () => {
        setLoading(true);
        setError("");

        try {
            const payload: any = { name: form.name, role: form.role };
            if (form.password) payload.password = form.password;

            const res = await fetch(`/api/staff/${staff._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to update staff");
            }

            onUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-green-700">Edit Staff: {staff.name}</h2>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
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

                    <div className="border-t pt-4 mt-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Reset Password</label>
                        <p className="text-xs text-gray-500 mb-2">Leave blank to keep current password.</p>
                        <input
                            type="password"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="New Password (Optional)"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
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
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Staff"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
