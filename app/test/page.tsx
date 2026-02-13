"use client";

export default function TestRegister() {
  const register = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin",
        email: "admin@test.com",
        password: "123456"
      })
    });
    const data = await res.json();
    console.log(data);
    alert("User Registered!");
  };

  return (
    <div className="p-10">
      <button
        onClick={register}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        Register Admin
      </button>
    </div>
  );
}
