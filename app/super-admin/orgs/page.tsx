"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Admin {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive' | 'disabled';
    lastLogin: string;
    createdAt: string;
    organization: string;
}

export default function SuperAdminOrgsPage() {
    const [orgs, setOrgs] = useState<any[]>([]);
    const [archivedOrgs, setArchivedOrgs] = useState<any[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminLoading, setAdminLoading] = useState(false);
    const [secret, setSecret] = useState("tanzanex-super-secret-2026");
    const [msg, setMsg] = useState("");
    const [activeTab, setActiveTab] = useState<"orgs" | "admins" | "archived">("orgs");
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [deleteOption, setDeleteOption] = useState<"archive" | "delete">("archive");

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/organizations?secret=${secret}`);
            const data = await res.json();
            if (res.ok) {
                // API now filters out archived organizations automatically
                setOrgs(data);
            } else {
                setMsg(data.message || "Failed to fetch orgs");
            }
        } catch (err) {
            setMsg("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedOrgs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/organizations?secret=${secret}&includeArchived=true`);
            const data = await res.json();
            if (res.ok) {
                // Filter only archived organizations
                const archived = data.filter((org: any) => org.subscriptionStatus === "archived");
                console.log("Found archived organizations:", archived);
                setArchivedOrgs(archived);
            } else {
                setMsg(data.message || "Failed to fetch archived orgs");
            }
        } catch (err) {
            setMsg("Connection error fetching archived orgs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    useEffect(() => {
        console.log("Tab changed to:", activeTab);
        if (activeTab === "admins") {
            fetchAdmins();
        } else if (activeTab === "archived") {
            fetchArchivedOrgs();
        }
    }, [activeTab, secret]);

    const updateStatus = async (orgId: string, status: string) => {
        try {
            const res = await fetch("/api/admin/activate-org", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId, status, secret }),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg(`Success: ${data.message}`);
                fetchOrgs();
            } else {
                setMsg(data.message || "Failed to update");
            }
        } catch (err) {
            setMsg("Update failed");
        }
    };

    const fetchAdmins = async () => {
        setAdminLoading(true);
        console.log("Fetching admins with secret:", secret);
        try {
            const res = await fetch(`/api/super-admin/admins?secret=${secret}`);
            console.log("Response status:", res.status);
            const data = await res.json();
            console.log("Response data:", data);
            if (res.ok) {
                setAdmins(data.admins || []);
                console.log("Admins set:", data.admins);
            } else {
                setMsg(data.message || "Failed to fetch admins");
                console.log("Error:", data.message);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setMsg("Connection error fetching admins");
        } finally {
            setAdminLoading(false);
        }
    };

    const resetAdminPassword = async () => {
        if (!selectedAdmin || !newPassword) {
            setMsg("Please select an admin and enter a new password");
            return;
        }

        try {
            const res = await fetch(`/api/super-admin?secret=${secret}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reset_admin_password",
                    adminId: selectedAdmin._id,
                    newPassword: newPassword
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg(`Password reset successfully for ${selectedAdmin.name}`);
                setShowPasswordReset(false);
                setNewPassword("");
                setSelectedAdmin(null);
                fetchAdmins();
            } else {
                setMsg(data.message || "Failed to reset password");
            }
        } catch (err) {
            setMsg("Error resetting password");
        }
    };

    const handleDeleteOrg = (org: any) => {
        setSelectedOrg(org);
        setShowDeleteModal(true);
    };

    const confirmDeleteOrg = async () => {
        if (!selectedOrg) return;

        console.log("Starting archive/delete for:", selectedOrg.name, "Action:", deleteOption);

        try {
            const res = await fetch(`/api/super-admin?secret=${secret}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: deleteOption,
                    orgId: selectedOrg._id
                }),
            });
            console.log("API response status:", res.status);
            const data = await res.json();
            console.log("API response data:", data);
            
            if (res.ok) {
                setMsg(`Organization ${deleteOption === "archive" ? "archived" : "deleted"} successfully`);
                setShowDeleteModal(false);
                setSelectedOrg(null);
                fetchOrgs();
                if (deleteOption === "archive") {
                    fetchArchivedOrgs();
                }
            } else {
                setMsg(data.message || `Failed to ${deleteOption} organization`);
            }
        } catch (err) {
            console.error("Archive/delete error:", err);
            setMsg(`Error ${deleteOption}ing organization`);
        }
    };

    const restoreOrg = async (orgId: string) => {
        if (!confirm("Are you sure you want to restore this organization?")) return;

        try {
            const res = await fetch(`/api/super-admin?secret=${secret}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "restore",
                    orgId: orgId
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg("Organization restored successfully");
                fetchArchivedOrgs();
            } else {
                setMsg(data.message || "Failed to restore organization");
            }
        } catch (err) {
            setMsg("Error restoring organization");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tighter">
                        Super-Admin Control Panel
                    </h1>
                    <div className="flex items-center space-x-4">
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="px-4 py-2 border rounded-lg text-sm"
                            placeholder="Admin Secret Key"
                        />
                        <button
                            onClick={activeTab === "orgs" ? fetchOrgs : fetchAdmins}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Refresh
                        </button>
                        {activeTab === "orgs" && (
                            <button
                                onClick={async () => {
                                    if (!confirm("This will link all data without an organization to 'Tanzanex Main'. Continue?")) return;
                                    setLoading(true);
                                    try {
                                        const res = await fetch(`/api/admin/migrate-legacy?secret=${secret}`);
                                        const data = await res.json();
                                        setMsg(data.message || "Migration Successful");
                                        fetchOrgs();
                                    } catch (err) {
                                        setMsg("Migration Flow Error");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-bold"
                            >
                                Restore Legacy Data
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("orgs")}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                            activeTab === "orgs"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Organizations ({orgs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("admins")}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                            activeTab === "admins"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Admin Management ({admins.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("archived")}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                            activeTab === "archived"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Archived ({archivedOrgs.length})
                    </button>
                </div>

                {msg && (
                    <div className={`p-4 mb-6 rounded-lg font-medium text-center shadow-sm ${msg.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {msg}
                    </div>
                )}

                {activeTab === "orgs" ? (
                loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orgs.map((org) => (
                                    <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{org.name}</div>
                                            <div className="text-xs text-gray-400">{org._id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${org.subscriptionStatus === "active" ? "bg-green-100 text-green-700" :
                                                org.subscriptionStatus === "trial" ? "bg-blue-100 text-blue-700" :
                                                    org.subscriptionStatus === "suspended" ? "bg-red-100 text-red-700" :
                                                        "bg-gray-100 text-gray-700"
                                                }`}>
                                                {org.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {org.expiryDate ? new Date(org.expiryDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() => updateStatus(org._id, "active")}
                                                className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                                            >
                                                Activate (1st Year)
                                            </button>
                                            <button
                                                onClick={() => updateStatus(org._id, "suspended")}
                                                className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                                            >
                                                Suspend
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrg(org)}
                                                className="text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 font-bold"
                                            >
                                                Archive/Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orgs.length === 0 && (
                            <div className="p-12 text-center text-gray-500 italic">No organizations found.</div>
                        )}
                    </div>
                )
            ) : activeTab === "admins" ? (
                adminLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {admins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{admin.name}</div>
                                            <div className="text-xs text-gray-400">{admin._id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                admin.status === 'active' ? 'bg-green-100 text-green-700' :
                                                admin.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(admin.lastLogin).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedAdmin(admin);
                                                    setShowPasswordReset(true);
                                                }}
                                                className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-bold"
                                            >
                                                Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {admins.length === 0 && (
                            <div className="p-12 text-center text-gray-500 italic">No administrators found.</div>
                        )}
                    </div>
                )
            ) : (
                loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Archived Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Original Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {archivedOrgs.map((org) => (
                                    <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{org.name}</div>
                                            <div className="text-xs text-gray-400">{org._id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {org.archivedAt ? new Date(org.archivedAt).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${org.subscriptionStatus === "active" ? "bg-green-100 text-green-700" :
                                                org.subscriptionStatus === "trial" ? "bg-blue-100 text-blue-700" :
                                                    org.subscriptionStatus === "suspended" ? "bg-red-100 text-red-700" :
                                                        "bg-gray-100 text-gray-700"
                                                }`}>
                                                {org.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => restoreOrg(org._id)}
                                                className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                                            >
                                                Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {archivedOrgs.length === 0 && (
                            <div className="p-12 text-center text-gray-500 italic">No archived organizations found.</div>
                        )}
                    </div>
                )
            )}

            {/* Password Reset Modal */}
            {showPasswordReset && selectedAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            Reset Password: {selectedAdmin.name}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPasswordReset(false);
                                        setSelectedAdmin(null);
                                        setNewPassword("");
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={resetAdminPassword}
                                    disabled={!newPassword}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive/Delete Organization Modal */}
            {showDeleteModal && selectedOrg && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {deleteOption === "archive" ? "Archive Organization" : "Delete Organization"}: {selectedOrg.name}
                        </h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Choose what you want to do with this organization:
                            </p>
                            
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="archive"
                                        checked={deleteOption === "archive"}
                                        onChange={(e) => setDeleteOption(e.target.value as "archive" | "delete")}
                                        className="mr-2"
                                    />
                                    <div>
                                        <span className="font-medium">Archive Organization</span>
                                        <p className="text-xs text-gray-500">Keep all data but hide from active list. Can be restored later.</p>
                                    </div>
                                </label>
                                
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="delete"
                                        checked={deleteOption === "delete"}
                                        onChange={(e) => setDeleteOption(e.target.value as "archive" | "delete")}
                                        className="mr-2"
                                    />
                                    <div>
                                        <span className="font-medium text-red-600">Delete Organization</span>
                                        <p className="text-xs text-red-500">⚠️ Permanently delete all data including loans, borrowers, transactions. This cannot be undone!</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedOrg(null);
                                    setDeleteOption("archive");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteOrg}
                                className={`flex-1 px-4 py-2 rounded-lg font-bold ${
                                    deleteOption === "delete" 
                                        ? "bg-red-600 text-white hover:bg-red-700" 
                                        : "bg-orange-600 text-white hover:bg-orange-700"
                                }`}
                            >
                                {deleteOption === "archive" ? "Archive" : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 text-center">
                <Link href="/login" className="text-emerald-600 font-bold hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    </div>
    );
}
