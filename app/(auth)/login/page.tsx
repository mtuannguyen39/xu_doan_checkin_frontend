"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Email hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c14] px-4">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -transalte-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/30">
            Logo
          </div>
          <h1 className="text-2xl font-black text-white">
            Xứ Đoàn Chúa Ba Ngôi - Giáo Xứ Tân Trang
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Hệ thống điểm danh thiếu nhi
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl border border-white/10 p-6"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/20 outline-none focus:border-amber-500/50 focus:bg-white-8 transition-all text-sm"
                placeholder="huynh.truong@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/20 outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all text-sm"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-black text-sm shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all disabled:opacity-50 disabled:curser-not-allowed"
          >
            {loading ?
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Đang đăng nhập...
              </span>
            : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
