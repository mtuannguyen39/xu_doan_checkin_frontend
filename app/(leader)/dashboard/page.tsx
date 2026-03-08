"use client";

import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute, ShowIf } from "@/components/ProtectedRoute/page";
import { useExportExcel } from "@/hooks/useExportExcel";

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

  const { exportAll, exporting } = useExportExcel();

  useEffect(() => {
    api
      .get("/statistics/dashboard")
      .then((res) => {
        const d = res.data;
        if (d?.overview) {
          setStats({
            total_students: d.overview.total_students ?? 0,
            total_checkins: d.overview.total_checkins ?? 0,
            today_checkins: d.overview.today_checkins ?? 0,
            classes: (d.class_stats ?? []).map((c: any) => ({
              class_name: c.class_name,
              total_students: c.total_students ?? 0,
              today_checkins: c.today_checkins ?? 0,
            })),
          });
        } else {
          setStats({
            total_students: d?.total_students ?? 0,
            total_checkins: d?.total_checkins ?? 0,
            today_checkins: d?.today_checkins ?? 0,
            classes: (d?.classes ?? []).map((c: any) => ({
              class_name: c.class_name,
              total_students: c.total_students ?? 0,
              today_checkins: c.today_checkins ?? 0,
            })),
          });
        }
      })
      .catch(() =>
        setStats({
          total_students: 0,
          total_checkins: 0,
          today_checkins: 0,
          classes: [],
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const myRole = user?.role ?? "";
  const canManageUsers = [
    "SUPER_ADMIN",
    "XU_DOAN_TRUONG",
    "XU_DOAN_PHO",
  ].includes(myRole);

  const attendanceRate =
    stats && stats.total_students > 0 ?
      Math.round((stats.today_checkins / stats.total_students) * 100)
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#080c14] text-white">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-125 h-125 bg-amber-500/4 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-125 h-125 bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        {/* ── Navbar ── */}
        <nav
          className="relative z-20 border-b border-white/6 px-4 py-3"
          style={{
            background: "rgba(8,12,20,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                }}
              >
                ✝️
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-bold text-sm leading-none">
                  Xứ Đoàn Chúa Ba Ngôi
                </p>
                <p className="text-white/30 text-[10px] mt-0.5">
                  Hệ thống điểm danh
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Nút Quản lý tài khoản — chỉ hiện với role có quyền, trên desktop */}
              {canManageUsers && (
                <button
                  onClick={() => router.push("/admin/users")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    borderColor: "rgba(99,102,241,0.25)",
                    color: "#a5b4fc",
                  }}
                >
                  👥 Quản lý tài khoản
                </button>
              )}

              {/* User pill */}
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  }}
                >
                  {user?.full_name?.charAt(0) ?? "?"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-xs font-semibold leading-none">
                    {user?.full_name}
                  </p>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    {ROLE_LABELS[myRole] ?? myRole}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="px-2.5 py-1.5 rounded-lg text-white/40 text-xs hover:text-white/70 hover:bg-white/5 transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </nav>

        {/* ── Page body ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Greeting + mobile user management button */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-white">
                Xin chào, {user?.full_name?.split("  ")} 👋 {/* ĐÃ fix*/}
              </h1>
              <p className="text-white/40 text-sm mt-1">
                {user?.class_name ?
                  `Trưởng lớp ${user.class_name}`
                : "Tổng quan hệ thống"}
              </p>
            </div>

            {/* Mobile-only: nút quản lý tài khoản */}
            {canManageUsers && (
              <button
                onClick={() => router.push("/admin/users")}
                className="sm:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  borderColor: "rgba(99,102,241,0.25)",
                  color: "#a5b4fc",
                }}
              >
                👥 Quản lý TK
              </button>
            )}
          </div>

          {/* ── Quick nav grid ── */}
          <div className="grid grid-cols-3 gap-2.5 mb-8 sm:grid-cols-5">
            <NavCard
              icon="📷"
              label="Điểm danh"
              color="#3b82f6"
              onClick={() => router.push("/scan")}
            />
            <NavCard
              icon="🏆"
              label="Xếp hạng"
              color="#f59e0b"
              onClick={() => router.push("/leaderboard")}
            />
            <NavCard
              icon="🏫"
              label="Danh sách lớp"
              color="#a855f7"
              onClick={() => router.push("/classes")}
            />
            {canManageUsers && (
              <>
                <NavCard
                  icon="📊"
                  label="Thống kê"
                  color="#10b981"
                  onClick={() => router.push("/statistics")}
                />
                <NavCard
                  icon="👥"
                  label="Quản lý TK"
                  color="#6366f1"
                  onClick={() => router.push("/admin/users")}
                />
              </>
            )}
          </div>

          {/* ── Stats ── */}
          {loading ?
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          : stats ?
            <>
              {/* 3 stat cards */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <StatCard
                  label="Tổng thiếu nhi"
                  value={stats.total_students}
                  icon="👦"
                  valueColor="#93c5fd"
                  bg="rgba(59,130,246,0.08)"
                  border="rgba(59,130,246,0.18)"
                />
                <StatCard
                  label="Điểm danh hôm nay"
                  value={stats.today_checkins}
                  sub={`${attendanceRate}% có mặt`}
                  icon="✅"
                  valueColor="#fcd34d"
                  bg="rgba(245,158,11,0.1)"
                  border="rgba(245,158,11,0.25)"
                  highlight
                />
                <StatCard
                  label="Tổng lượt ĐD"
                  value={stats.total_checkins}
                  icon="📅"
                  valueColor="#c4b5fd"
                  bg="rgba(168,85,247,0.07)"
                  border="rgba(168,85,247,0.18)"
                />
              </div>

              {/* Class grid */}
              {stats.classes.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                      Theo lớp
                    </h2>
                    <span className="text-white/20 text-xs">
                      {stats.classes.length} lớp
                    </span>
                    {[
                      "SUPER_ADMIN",
                      "XU_DOAN_TRUONG",
                      "XU_DOAN_PHO",
                      "TRUONG_TRUC",
                    ].includes(user?.role ?? "") && (
                      <button
                        onClick={async () => {
                          try {
                            await exportAll();
                          } catch (e: any) {
                            alert(e.message);
                          }
                        }}
                        disabled
                        // disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        {exporting ?
                          <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                        : "📥 "}
                        {exporting ? "Đang xuất..." : "Xuất Excel toàn đoàn"}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.classes.map((cls) => {
                      const pct =
                        cls.total_students > 0 ?
                          Math.round(
                            (cls.today_checkins / cls.total_students) * 100,
                          )
                        : 0;
                      const barColor =
                        pct >= 80 ? "#10b981"
                        : pct >= 50 ? "#f59e0b"
                        : "#ef4444";

                      return (
                        <button
                          key={cls.class_name}
                          onClick={() =>
                            router.push(
                              `/classes/${encodeURIComponent(cls.class_name)}`,
                            )
                          }
                          className="text-left rounded-2xl p-4 border transition-all group hover:scale-[1.015]"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            borderColor: "rgba(255,255,255,0.08)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <h3 className="font-bold text-white text-sm">
                              {cls.class_name}
                            </h3>
                            <span className="text-white/20 group-hover:text-white/50 transition-colors text-sm">
                              →
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div
                            className="w-full h-1 rounded-full mb-2.5"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex gap-3 text-white/40">
                              <span>
                                <span className="text-white font-semibold">
                                  {cls.total_students}
                                </span>{" "}
                                em
                              </span>
                              <span>
                                Hôm nay:{" "}
                                <span
                                  className="font-semibold"
                                  style={{ color: barColor }}
                                >
                                  {cls.today_checkins}
                                </span>
                              </span>
                            </div>
                            <span
                              className="font-bold"
                              style={{ color: barColor }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          : <div className="text-center py-16 text-white/20">
              <p className="text-4xl mb-3">📡</p>
              <p className="text-sm">Không thể tải dữ liệu</p>
            </div>
          }
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ── NavCard ────────────────────────────────────────────────
function NavCard({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-3.5 text-center border transition-all hover:scale-[1.04] group"
      style={{ background: `${color}12`, borderColor: `${color}28` }}
    >
      <p className="text-xl mb-1.5">{icon}</p>
      <p className="text-white/60 group-hover:text-white text-[11px] font-semibold transition-colors leading-tight">
        {label}
      </p>
    </button>
  );
}

// ── StatCard ───────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  valueColor,
  bg,
  border,
  highlight,
}: {
  label: string;
  value: number | undefined | null;
  sub?: string;
  icon: string;
  valueColor: string;
  bg: string;
  border: string;
  highlight?: boolean;
}) {
  const safe = value ?? 0;
  return (
    <div
      className={`rounded-2xl p-4 border ${highlight ? "ring-1 ring-amber-500/20" : ""}`}
      style={{ background: bg, borderColor: border }}
    >
      <p className="text-lg mb-1.5">{icon}</p>
      <p className="text-white/40 text-[11px] font-medium leading-tight mb-1">
        {label}
      </p>
      <p className="text-2xl font-black" style={{ color: valueColor }}>
        {safe.toLocaleString()}
      </p>
      {sub && <p className="text-white/25 text-[10px] mt-0.5">{sub}</p>}
    </div>
  );
}
