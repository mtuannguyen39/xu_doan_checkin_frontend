"use client";

import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (error) {
      alert("Đăng nhập thất bại!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold">Đăng nhập</h1>
        <input
          className="mb-4 w-full rounded-lg border p-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-6 w-full rounded-lg border p-3"
          placeholder="Mật khẩu"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
