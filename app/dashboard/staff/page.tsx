"use client";

import { useEffect, useState } from "react";
import AddStaffModal from "./AddStaffModal";
import EditStaffModal from "./EditStaffModal";

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: "staff" | "manager" | "admin";
  active: boolean;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStaff(staff.filter((s) => s._id !== id));
      } else {
        alert("Failed to delete staff");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700";
      case "manager": return "bg-blue-100 text-blue-700";
      default: return "bg-green-100 text-green-700";
    }
  };

  if (loading) return <div className="p-6">Loading staff...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Staff Management</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          + Add Staff
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow-md bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Role</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user) => (
              <tr key={user._id} className="border-b hover:bg-green-50 transition">
                <td className="py-3 px-4 text-black font-medium">{user.name}</td>
                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {user.active ? (
                    <span className="text-green-600 font-semibold text-sm">Active</span>
                  ) : (
                    <span className="text-red-500 font-semibold text-sm">Inactive</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setEditStaff(user)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                    >
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No staff members found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddStaffModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={fetchStaff}
      />

      <EditStaffModal
        isOpen={!!editStaff}
        onClose={() => setEditStaff(null)}
        onUpdated={fetchStaff}
        staff={editStaff}
      />
    </div>
  );
}
