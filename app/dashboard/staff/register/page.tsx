"use client";

import { useState } from "react";

export default function RegisterStaffPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [msg, setMsg] = useState("");

  const handleRegister = async () => {
    const token = localStorage.getItem("token"); // admin token
    const res = await fetch("/api/staff/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, email, password, role }),
    });

    if (res.ok) {
      setMsg("Staff registered successfully!");
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("staff");
    } else {
      const text = await res.text();
      setMsg(text);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold text-green-600">Register Staff</h2>
      <input
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        placeholder="Full Name"
        className="input input-bordered w-full"
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="input input-bordered w-full"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="input input-bordered w-full"
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="select select-bordered w-full"
      >
        <option value="staff">Staff</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleRegister} className="btn w-full bg-green-600 hover:bg-green-700">
        Register
      </button>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}
