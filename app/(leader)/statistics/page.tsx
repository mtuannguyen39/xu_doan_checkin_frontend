"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { ProtectedRoute } from "@/components/ProtectedRoute/page";

interface Overview {
  total_students: number;
  total_sessions: number;
  total_checkins: number;
  total_points: number;
  avg_attendance_rate: number;
  on_time_rate: number;
  late_5pts_rate: number;
  late_0pts_rate: number;
  on_time_count: number;
  late_5_count: number;
  late_0_count: number;
}

interface ClassStat {
  class_name: string;
  total_students: number;
  total_checkins: number;
  total_points: number;
  on_time_count: number;
  on_time_rate: number;
  attendance_rate: number;
}

interface Session {
  date: string;
  total: number;
  on_time: number;
  rate: number;
  on_time_rate: number;
}

function RingChart({
  value,
  color,
  size = 80,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="7"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={`${(value / 100) * circ} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

function StatBig({
  label,
  value,
  unit = "",
  color = "text-white",
  sub,
}: {
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/8 p-5"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      <p className="text-white/40 text-xs font-semibold mb-2">{label}</p>
      <p className={`text-3xl font-black ${color}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
        <span className="text-base font-normal ml-1 text-white/50">{unit}</span>
      </p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function StatisticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/statistics")
      .then((res) => {
        setOverview(res.data.overview);
        setClassStats(res.data.class_stats);
        setSessions(res.data.recent_sessions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  if (!overview) return null;

  const maxAttend = Math.max(...classStats.map((c) => c.attendance_rate), 1);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#080c14] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black">📊 Thống kê tổng quan</h1>
            <p className="text-white/40 text-sm mt-1">
              Tình trạng điểm danh của xứ đoàn
            </p>
          </div>

          {/* Overview cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatBig
              label="Thiếu nhi"
              value={overview.total_students}
              color="text-white"
            />
            <StatBig
              label="Buổi sinh hoạt"
              value={overview.total_sessions}
              color="text-blue-400"
            />
            <StatBig
              label="Lượt điểm danh"
              value={overview.total_checkins}
              color="text-indigo-400"
            />
            <StatBig
              label="Tổng điểm"
              value={overview.total_points}
              unit="đ"
              color="text-amber-400"
            />
          </div>

          {/* Punctuality + Attendance rings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* % Chuyên cần */}
            <div
              className="rounded-2xl border border-white/8 p-6"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-white/50 text-sm font-semibold mb-4">
                📅 Tỷ lệ chuyên cần
              </p>
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <RingChart
                    value={overview.avg_attendance_rate}
                    color="#3b82f6"
                    size={90}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-blue-400">
                    {overview.avg_attendance_rate}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-white/70">
                    Trung bình{" "}
                    <span className="text-blue-400 font-bold">
                      {overview.avg_attendance_rate}%
                    </span>{" "}
                    thiếu nhi tham dự mỗi buổi
                  </p>
                  <p className="text-white/40 text-xs">
                    {overview.total_checkins} lượt /{" "}
                    {overview.total_students * overview.total_sessions} tổng
                    slot
                  </p>
                </div>
              </div>
            </div>

            {/* % Đúng giờ */}
            <div
              className="rounded-2xl border border-white/8 p-6"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-white/50 text-sm font-semibold mb-4">
                ⏰ Tỷ lệ đúng giờ (trong các buổi đã đến)
              </p>
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <RingChart
                    value={overview.on_time_rate}
                    color="#10b981"
                    size={90}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-emerald-400">
                    {overview.on_time_rate}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-white/60">Đúng giờ (10đ)</span>
                    <span className="text-emerald-400 font-bold ml-auto">
                      {overview.on_time_count} lượt · {overview.on_time_rate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-white/60">Trễ nhẹ (5đ)</span>
                    <span className="text-amber-400 font-bold ml-auto">
                      {overview.late_5_count} lượt · {overview.late_5pts_rate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-white/60">Trễ (0đ)</span>
                    <span className="text-red-400 font-bold ml-auto">
                      {overview.late_0_count} lượt · {overview.late_0pts_rate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent sessions bar chart */}
          {sessions.length > 0 && (
            <div
              className="rounded-2xl border border-white/8 p-6 mb-8"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-white/50 text-sm font-semibold mb-5">
                📆 7 buổi gần nhất
              </p>
              <div className="flex items-end gap-3 h-32">
                {sessions.map((s, i) => {
                  const heightAttend = Math.max((s.rate / 100) * 100, 4);
                  const heightOnTime = Math.max(
                    (s.on_time_rate / 100) * heightAttend,
                    0,
                  );
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full flex flex-col justify-end"
                        style={{ height: "100px" }}
                      >
                        <div
                          className="relative w-full rounded-t-lg overflow-hidden"
                          style={{
                            height: `${heightAttend}%`,
                            backgroundColor: "rgba(59,130,246,0.2)",
                          }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-lg"
                            style={{
                              height: `${s.on_time_rate}%`,
                              backgroundColor: "rgba(16,185,129,0.6)",
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-white/30 text-[9px] text-center">
                        {new Date(s.date).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                      <p className="text-blue-400 text-[10px] font-bold">
                        {s.rate}%
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "rgba(59,130,246,0.4)" }}
                  />
                  Tỷ lệ đi học
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "rgba(16,185,129,0.6)" }}
                  />
                  Trong đó đúng giờ
                </div>
              </div>
            </div>
          )}

          {/* Class stats table */}
          <div
            className="rounded-2xl border border-white/8 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="px-5 py-4 border-b border-white/8">
              <p className="text-white/60 text-sm font-semibold">
                🏫 Thống kê theo lớp
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    <th className="px-4 py-3 text-left text-xs text-white/30 font-semibold uppercase">
                      Lớp
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-white/30 font-semibold uppercase">
                      SL
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-white/30 font-semibold uppercase">
                      Chuyên cần
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-white/30 font-semibold uppercase">
                      Đúng giờ
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-white/30 font-semibold uppercase">
                      Tổng điểm
                    </th>
                    <th className="px-5 py-3 text-right text-xs text-white/30 font-semibold uppercase">
                      Biểu đồ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classStats.map((cls, i) => {
                    const barW = Math.round(
                      (cls.attendance_rate / maxAttend) * 100,
                    );
                    const attendColor =
                      cls.attendance_rate >= 80 ? "#10b981"
                      : cls.attendance_rate >= 60 ? "#f59e0b"
                      : "#ef4444";
                    return (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-white font-semibold text-sm">
                            {cls.class_name}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center text-white/60 text-sm">
                          {cls.total_students}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="font-bold text-sm"
                            style={{ color: attendColor }}
                          >
                            {cls.attendance_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-emerald-400 font-bold text-sm">
                            {cls.on_time_rate}%
                          </span>
                          <p className="text-white/30 text-[10px]">
                            {cls.on_time_count} lượt
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-amber-400 font-bold text-sm">
                            {cls.total_points.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="w-24 h-2 rounded-full bg-white/8 ml-auto">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${barW}%`,
                                backgroundColor: attendColor,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
