"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute/page";

interface RankedStudent {
  rank: number;
  id: string;
  full_name: string;
  saint_name: string;
  class_name: string;
  nganh: string;
  total_checkins: number;
  total_point: number;
  attendance_rate: number;
  total_sessions: number;
}

type TabType = "attendance" | "points";

const NGANH_COLORS: Record<string, string> = {
  "Chiên Con": "#f59e0b",
  "Ấu nhi": "#10b981",
  "Thiếu Nhi": "#3b82f6",
  "Nghĩa Sĩ": "#8b5cf6",
  "Dự Trưởng": "#ef4444",
};

function getMedalStyle(rank: number) {
  if (rank === 1)
    return {
      bg: "from-yellow-400 to-amber-500",
      text: "text-yellow-900",
      icon: "👑",
      glow: "shadow-yellow-400/50",
    };
  if (rank === 2)
    return {
      bg: "from-slate-300 to-slate-400",
      text: "text-slate-900",
      icon: "🥈",
      glow: "shadow-slate-400/50",
    };
  if (rank === 3)
    return {
      bg: "from-orange-400 to-amber-600",
      text: "text-orange-900",
      icon: "🥉",
      glow: "shadow-orange-400/50",
    };
  return {
    bg: "from-gray-700 to-gray-800",
    text: "text-gray-300",
    icon: "",
    glow: "",
  };
}

function RankBadge({ rank }: { rank: number }) {
  const style = getMedalStyle(rank);
  return (
    <div
      className={`w-10 h-10 rounded-full bg-linear-to-br ${style.bg} flex items-center justify-center font-black text-sm ${style.text} ${rank <= 3 ? `shadow-lg ${style.glow}` : ""}`}
    >
      {rank <= 3 ? style.icon : `#${rank}`}
    </div>
  );
}

function AttendanceBar({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? "#10b981"
    : rate >= 60 ? "#f59e0b"
    : rate >= 40 ? "#f97316"
    : "#ef4444";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${rate}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-bold tabular-nums w-10 text-right"
        style={{ color }}
      >
        {rate}%
      </span>
    </div>
  );
}

function TopThreeCard({
  student,
  tab,
}: {
  student: RankedStudent;
  tab: TabType;
}) {
  const style = getMedalStyle(student.rank);
  const isFirst = student.rank === 1;
  const nganhColor = NGANH_COLORS[student.nganh] || "#6b7280";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${isFirst ? "row-span-1" : ""}`}
      style={
        {
          background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)`,
          border: `1px solid rgba(255,255,255,0.12)`,
          boxShadow: (rank: any) =>
            rank <= 3 ? `0 0 30px ${style.glow}` : "none",
        } as any
      }
    >
      {/* Rank glow background */}
      {student.rank === 1 && (
        <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-amber-600/5 pointer-events-none" />
      )}

      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <RankBadge rank={student.rank} />
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ backgroundColor: `${nganhColor}25`, color: nganhColor }}
          >
            {student.nganh}
          </span>
        </div>

        <div className="mb-3">
          <p className="font-bold text-white text-lg leading-tight">
            {student.full_name}
          </p>
          <p className="text-white/50 text-sm">
            {student.saint_name} · {student.class_name}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs mb-0.5">
              {tab === "attendance" ? "Số buổi" : "Tổng điểm"}
            </p>
            <p className="text-2xl font-black text-white">
              {tab === "attendance" ?
                student.total_checkins
              : student.total_point}
            </p>
          </div>
          {tab === "attendance" && (
            <div className="w-24">
              <AttendanceBar rate={student.attendance_rate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>("attendance");
  const [data, setData] = useState<RankedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNganh, setFilterNganh] = useState("");
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    fetchData();
  }, [tab, filterNganh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint =
        tab === "attendance" ?
          "/leaderboard/attendance"
        : "/leaderboard/points";
      const params = new URLSearchParams({ limit: "50" });
      if (filterNganh) params.append("nganh", filterNganh);

      const res = await api.get(`${endpoint}?${params}`);
      setData(res.data.data || []);
      setTotalSessions(res.data.total_sessions || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <ProtectedRoute permissions={["leaderboard:read"]}>
      <div className="min-h-screen bg-[#080c14] text-white">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏆</span>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  Bảng Xếp Hạng
                </h1>
                <p className="text-white/40 text-sm">
                  {user?.class_name ? `Lớp ${user.class_name}` : "Toàn xứ đoàn"}
                  {totalSessions > 0 && ` · ${totalSessions} buổi sinh hoạt`}
                </p>
              </div>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("attendance")}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === "attendance" ?
                  "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              📅 Chuyên cần
            </button>
            <button
              onClick={() => setTab("points")}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === "points" ?
                  "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              ⭐ Điểm số
            </button>

            {/* Filter Ngành */}
            <select
              value={filterNganh}
              onChange={(e) => setFilterNganh(e.target.value)}
              className="ml-auto px-4 py-2.5 rounded-xl bg-white/5 text-white/70 text-sm border border-white/10 outline-none focus:border-amber-500/50"
            >
              <option value="" className="text-black">
                Tất cả ngành
              </option>
              {Object.keys(NGANH_COLORS).map((n) => (
                <option key={n} value={n} className="text-black">
                  {n}
                </option>
              ))}
            </select>
          </div>

          {loading ?
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
            </div>
          : data.length === 0 ?
            <div className="text-center py-20 text-white/30">
              <p className="text-4xl mb-3">📭</p>
              <p>Chưa có dữ liệu điểm danh</p>
            </div>
          : <>
              {/* Top 3 Podium */}
              {top3.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {/* Sắp xếp: 2, 1, 3 kiểu podium */}
                  {[top3[1], top3[0], top3[2]].filter(Boolean).map((s) => (
                    <TopThreeCard key={s.id} student={s} tab={tab} />
                  ))}
                </div>
              )}

              {/* Rest of leaderboard */}
              {rest.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden border border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  {rest.map((student, idx) => {
                    const nganhColor = NGANH_COLORS[student.nganh] || "#6b7280";
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors ${
                          idx !== rest.length - 1 ?
                            "border-b border-white/5"
                          : ""
                        }`}
                      >
                        {/* Rank */}
                        <span className="w-8 text-center text-white/30 font-bold text-sm tabular-nums">
                          #{student.rank}
                        </span>

                        {/* Avatar placeholder */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            backgroundColor: `${nganhColor}20`,
                            color: nganhColor,
                          }}
                        >
                          {student.full_name.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">
                            {student.full_name}
                          </p>
                          <p className="text-white/40 text-xs">
                            {student.class_name}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="text-right shrink-0">
                          {tab === "attendance" ?
                            <>
                              <p className="font-bold text-white text-sm">
                                {student.total_checkins} buổi
                              </p>
                              <div className="w-20">
                                <AttendanceBar rate={student.attendance_rate} />
                              </div>
                            </>
                          : <>
                              <p className="font-bold text-white text-sm">
                                {student.total_point} điểm
                              </p>
                              <p className="text-white/40 text-xs">
                                {student.total_checkins} buổi
                              </p>
                            </>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          }
        </div>
      </div>
    </ProtectedRoute>
  );
}
