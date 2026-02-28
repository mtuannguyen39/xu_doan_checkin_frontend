"use client";

import { ClassCard } from "@/components/ClassCard/page";
import { ProtectedRoute } from "@/components/ProtectedRoute/page"; // Sửa lại đường dẫn thư mục
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ClassInfo {
  class_name: string;
  nganh: string;
  total_students: number;
  total_checkins: number;
  total_points: number;
  recent_checkins: number;
}

const NGANH_COLORS: Record<
  string,
  { bg: string; accent: string; border: string }
> = {
  "Chiên Con": {
    bg: "from-amber-500/10 to-yellow-600/5",
    accent: "#f59e0b",
    border: "border-amber-500/20",
  },
  "Ấu nhi": {
    bg: "from-emerald-500/10 to-green-600/5",
    accent: "#10b981",
    border: "border-emerald-500/20",
  },
  "Thiếu Nhi": {
    bg: "from-blue-500/10 to-indigo-600/5",
    accent: "#3b82f6",
    border: "border-blue-500/20",
  },
  "Nghĩa Sĩ": {
    bg: "from-purple-500/10 to-violet-600/5",
    accent: "#8b5cf6",
    border: "border-purple-500/20",
  },
  "Dự Trưởng": {
    bg: "from-rose-500/10 to-red-600/5",
    accent: "#ef4444",
    border: "border-rose-500/20",
  },
};

export default function ClassesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupByNganh, setGroupByNganh] = useState(true);

  useEffect(() => {
    api
      .get("/leaderboard/classes")
      .then((res) => setClasses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = classes.reduce<Record<string, ClassInfo[]>>((acc, cls) => {
    if (!acc[cls.nganh]) acc[cls.nganh] = [];
    acc[cls.nganh].push(cls);
    return acc;
  }, {});

  const handleClickClass = (className: string) => {
    router.push(`/classes/${encodeURIComponent(className)}`);
  };

  return (
    <ProtectedRoute permissions={["classes:read", "classes:read_own"]}>
      <div className="min-h-screen bg-[#080c14] text-white">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                🏫 Danh sách lớp
              </h1>
              <p className="text-white/40 text-sm mt-1">
                {user?.class_name ?
                  `Lớp ${user.class_name}`
                : `${classes.length} lớp - ${classes.reduce((s, c) => s + c.total_students, 0)} thiếu nhi`
                }
              </p>
            </div>

            {!user?.class_name && (
              <button
                onClick={() => setGroupByNganh(!groupByNganh)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
              >
                {groupByNganh ? "📋 Dạng danh sách" : "📂 Nhóm theo ngành"}
              </button>
            )}
          </div>

          {loading ?
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          : groupByNganh ?
            // Grouped by NGANH
            <div className="space-y-8">
              {Object.entries(grouped).map(([nganh, nganhClasses]) => {
                const theme = NGANH_COLORS[nganh] || {
                  bg: "from-gray-500/10 to-gray-600/5",
                  accent: "#6b7280",
                  border: "border-gray-500/20",
                };
                return (
                  <div key={nganh}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="h-px flex-1 opacity-20"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <span
                        className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${theme.accent}20`,
                          color: theme.accent,
                        }}
                      >
                        {nganh}
                      </span>
                      <div
                        className="h-px flex-1 opacity-20"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {nganhClasses.map((cls) => (
                        <ClassCard
                          key={cls.class_name}
                          cls={cls}
                          theme={theme}
                          onClick={() => handleClickClass(cls.class_name)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            //Flat list
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classes.map((cls) => {
                const theme = NGANH_COLORS[cls.nganh] || {
                  bg: "from-gray-500/10 to-gray-600/5",
                  accent: "#6b7280",
                  border: "border-gray-500/20",
                };
                return (
                  <ClassCard
                    key={cls.class_name}
                    cls={cls}
                    theme={theme}
                    onClick={() => handleClickClass(cls.class_name)}
                  />
                );
              })}
            </div>
          }
        </div>
      </div>
    </ProtectedRoute>
  );
}
