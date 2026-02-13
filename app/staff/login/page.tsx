"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("fullName", data.fullName);
      router.push("/dashboard");
    } else {
      const text = await res.text();
      setMsg(text);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-96 p-6 bg-white rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold text-green-600">Staff Login</h2>
        <input
          className="input input-bordered w-full"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input input-bordered w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className="btn w-full bg-green-600 hover:bg-green-700">
          Login
        </button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </div>
    </div>
  );
}
