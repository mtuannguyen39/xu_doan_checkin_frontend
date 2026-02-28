"use client";

import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute, ShowIf } from "@/components/ProtectedRoute/page";

interface DashboardStats {
  total_students: number;
  total_checkins: number;
  today_checkins: number;
  classes: {
    class_name: string;
    total_students: number;
    today_checkins: number;
  }[];
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "👑 Super Admin",
  XU_DOAN_TRUONG: "🌟 Xứ Đoàn Trưởng",
  XU_DOAN_PHO: "⭐ Xứ Đoàn Phó",
  TRUONG_TRUC: "🔷 Trưởng Trực",
  TRUONG_LOP: "📚 Trưởng Lớp",
};

export default function LeaderDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/statistics/dashboard")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#080c14] text-white">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 border-b border-white/8 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm">
                ✝️
              </div>
              <span className="font-bold text-white">Xứ Đoàn</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-white text-sm font-semibold">
                  {user?.full_name}
                </p>
                <p className="text-white/40 text-xs">
                  {ROLE_LABELS[user?.role || ""] || user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white">
              Xin chào, {user?.full_name?.split(" ").pop()} 👋
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {user?.class_name ?
                `Trưởng lớp ${user.class_name}`
              : "Tổng quan hệ thống"}
            </p>
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <NavCard
              icon="📷"
              label="Điểm danh"
              href="/scan"
              color="from-blue-500/20 to-blue-600/10 border-blue-500/20"
            />
            <NavCard
              icon="🏆"
              label="Xếp hạng"
              href="/leaderboard"
              color="from-amber-500/20 to-amber-600/10 border-amber-500/20"
            />
            <NavCard
              icon="🏫"
              label="Danh sách lớp"
              href="/classes"
              color="from-purple-500/20 to-purple-600/10 border-purple-500/20"
            />
            <ShowIf roles={["SUPER_ADMIN", "XU_DOAN_TRUONG", "XU_DOAN_PHO"]}>
              <NavCard
                icon="📊"
                label="Thống kê"
                href="/statistics"
                color="from-emerald-500/20 to-emerald-600/10 border-emerald-500/20"
              />
            </ShowIf>
          </div>

          {/* Stats */}
          {loading ?
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
            </div>
          : stats ?
            <>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <GlassCard
                  title="Tổng thiếu nhi"
                  value={stats.total_students}
                  icon="👦"
                />
                <GlassCard
                  title="Điểm danh hôm nay"
                  value={stats.today_checkins}
                  icon="✅"
                  accent
                />
                <GlassCard
                  title="Tổng buổi điểm danh"
                  value={stats.total_checkins}
                  icon="📅"
                />
              </div>

              {/* Class grid */}
              {stats.classes && stats.classes.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-white mb-4">
                    Theo lớp
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.classes.map((cls) => (
                      <button
                        key={cls.class_name}
                        onClick={() =>
                          router.push(
                            `/classes/${encodeURIComponent(cls.class_name)}`,
                          )
                        }
                        className="text-left rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/8 hover:scale-[1.02] transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-white">
                            {cls.class_name}
                          </h3>
                          <span className="text-white/20 group-hover:text-white/50 transition-colors text-sm">
                            →
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <p className="text-white/40 text-xs">Thiếu nhi</p>
                            <p className="font-bold text-white">
                              {cls.total_students}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">Hôm nay</p>
                            <p className="font-bold text-emerald-400">
                              {cls.today_checkins}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          : <div className="text-center py-12 text-white/30">
              <p>Không thể tải dữ liệu</p>
            </div>
          }
        </div>
      </div>
    </ProtectedRoute>
  );
}

function GlassCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number;
  icon: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${accent ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10"}`}
    >
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-white/50 text-xs mb-1">{title}</p>
      <p
        className={`text-3xl font-black ${accent ? "text-amber-400" : "text-white"}`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function NavCard({
  icon,
  label,
  href,
  color,
}: {
  icon: string;
  label: string;
  href: string;
  color: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className={`rounded-xl bg-gradient-to-br ${color} border p-4 text-center hover:scale-105 transition-all`}
    >
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-white text-xs font-semibold">{label}</p>
    </button>
  );
}
