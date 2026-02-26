"use client";

import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudentLogin() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    saint_name: "",
    class_name: "",
    nganh: "",
  });

  const handleSubmit = async () => {
    try {
      const res = await api.post("/students/login-or-create", form);

      localStorage.setItem("student", JSON.stringify(res.data));
      router.push("/student/qr");
    } catch (error) {
      alert("Đăng nhập thất bại!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/20 backdrop-blur-xl p-8 shadow-2xl border border-white/30">
        <h1 className="text-center text-2xl font-bold text-white mb-6">
          ĐĂNG NHẬP
        </h1>

        {Object.keys(form).map((key) => (
          <input
            key={key}
            placeholder={key.replace("_", " ")}
            className="mb-4 w-full rounded-xl bg-white/30 p-3 text-white placeholder-white/70 outline-none"
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ))}

        <button
          onClick={handleSubmit}
          className="w-full rounded-xl bg-white text-blue-600 py-3 font-semibold hover:bg-blue-100 transition"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
