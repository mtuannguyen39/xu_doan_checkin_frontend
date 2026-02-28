"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl mx-auto mb-6">
          🚫
        </div>
        <h1 className="text-2xl font-black text-white mb-2">
          Không có quyền truy cập
        </h1>
        <p className="text-white/40 text-sm mb-6">
          Tài khoản <span className="text-white/70">{user?.role}</span> không có
          quyền vào trang này.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors"
        >
          ← Về Dashboard
        </button>
      </div>
    </div>
  );
}
