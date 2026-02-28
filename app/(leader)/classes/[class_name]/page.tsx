"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { ProtectedRoute } from "@/components/ProtectedRoute/page";

interface Student {
  rank: number;
  id: string;
  full_name: string;
  saint_name: string;
  phone?: string;
  class_name: string;
  nganh: string;
  is_active: boolean;
  created_at: string;
  total_checkins: number;
  total_points: number;
  attendance_rate: number;
  recent_checkins: {
    date: string;
    point: number;
    activities: { name: string; point: number }[];
  }[];
}

interface ClassDetail {
  class_name: string;
  nganh: string;
  total_students: number;
  total_sessions: number;
  avg_attendance_rate: number;
  total_points: number;
}

function AttendanceDots({ rate }: { rate: number }) {
  const color = rate >= 80 ? "#10b981" : rate >= 60 ? "#f59e0b" : rate >= 40 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 36 36" className="rotate-[-90deg] w-8 h-8">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${(rate / 100) * 94.25} 94.25`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold" style={{ color }}>
          {rate}
        </span>
      </div>
      <span className="text-xs text-white/40">%</span>
    </div>
  );
}

function StudentRow({ student, index }: { student: Student; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <td className="px-4 py-3 text-center">
          <span className={`text-sm font-bold ${student.rank <= 3 ? "text-amber-400" : "text-white/30"}`}>
            #{student.rank}
          </span>
        </td>

        {/* Student info */}
        <td className="px-4 py-3">
          <div>
            <p className="font-semibold text-white text-sm">{student.full_name}</p>
            <p className="text-white/40 text-xs">{student.saint_name} · {student.id}</p>
          </div>
        </td>

        {/* Attendance rate */}
        <td className="px-4 py-3">
          <AttendanceDots rate={student.attendance_rate} />
        </td>

        {/* Total checkins */}
        <td className="px-4 py-3 text-center">
          <span className="font-bold text-white">{student.total_checkins}</span>
          <p className="text-white/30 text-xs">buổi</p>
        </td>

        {/* Total points */}
        <td className="px-4 py-3 text-center">
          <span className="font-bold text-blue-400">{student.total_points}</span>
          <p className="text-white/30 text-xs">điểm</p>
        </td>

        {/* Recent */}
        <td className="px-4 py-3 text-center">
          <div className="flex gap-1 justify-center">
            {student.recent_checkins.slice(0, 5).map((c, i) => (
              <div
                key={i}
                title={new Date(c.date).toLocaleDateString("vi")}
                className={`w-2.5 h-2.5 rounded-full ${c.point > 0 ? "bg-emerald-500" : "bg-red-500/50"}`}
              />
            ))}
          </div>
        </td>

        {/* Expand */}
        <td className="px-4 py-3 text-center">
          <span className={`text-white/30 text-xs transition-transform inline-block ${expanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-white/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.recent_checkins.map((c, i) => (
                <div key={i} className="rounded-xl bg-white/5 p-3">
                  <p className="text-white/60 text-xs mb-2">
                    📅 {new Date(c.date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
                    <span className="ml-2 font-bold text-amber-400">+{c.point} điểm</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.activities.map((a, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        {a.name} +{a.point}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {student.recent_checkins.length === 0 && (
                <p className="text-white/30 text-sm col-span-2">Chưa có lịch sử điểm danh</p>
              )}
            </div>
            {student.phone && (
              <p className="mt-3 text-white/40 text-xs">📞 {student.phone}</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const className = decodeURIComponent(params.class_name as string);

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "checkins">("rank");

  useEffect(() => {
    api.get(`/leaderboard/classes/${encodeURIComponent(className)}`)
      .then((res) => {
        setClassData(res.data.class);
        setStudents(res.data.students);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [className]);

  const filtered = students
    .filter((s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.saint_name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
      if (sortBy === "checkins") return b.total_checkins - a.total_checkins;
      return a.rank - b.rank;
    });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#080c14] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Quay lại
          </button>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Class Header */}
              {classData && (
                <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/20 p-6 mb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-white">{classData.class_name}</h1>
                      <p className="text-blue-400 font-medium mt-1">{classData.nganh}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard label="Thiếu nhi" value={classData.total_students} unit="" />
                      <StatCard label="Buổi SH" value={classData.total_sessions} unit="" />
                      <StatCard label="TB chuyên cần" value={classData.avg_attendance_rate} unit="%" color="text-emerald-400" />
                      <StatCard label="Tổng điểm" value={classData.total_points} unit="đ" color="text-amber-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap gap-3 mb-4">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Tìm tên, tên thánh, ID..."
                  className="flex-1 min-w-48 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-blue-500/50 text-sm"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm outline-none"
                >
                  <option value="rank">📊 Theo điểm</option>
                  <option value="checkins">📅 Theo buổi</option>
                  <option value="name">🔤 Theo tên</option>
                </select>
                <span className="self-center text-white/30 text-sm">
                  {filtered.length} / {students.length} học sinh
                </span>
              </div>

              {/* Table */}
              <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider w-12">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Học sinh</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Chuyên cần</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/30 uppercase tracking-wider">Buổi ĐD</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/30 uppercase tracking-wider">Điểm</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/30 uppercase tracking-wider">5 buổi gần nhất</th>
                        <th className="px-4 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((student, index) => (
                        <StudentRow key={student.id} student={student} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {filtered.length === 0 && (
                  <div className="py-12 text-center text-white/30">
                    <p className="text-3xl mb-2">🔍</p>
                    <p>Không tìm thấy học sinh nào</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, unit, color = "text-white" }: { label: string; value: number; unit: string; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>
        {value.toLocaleString()}<span className="text-sm font-normal ml-0.5">{unit}</span>
      </p>
    </div>
  );
}