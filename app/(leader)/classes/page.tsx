"use client";

import { ClassCard } from "@/components/ClassCard/page";
import { ProtectedRoute } from "@/components/ProtectedRoute/page";
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
    accent: "#f59e0b", // Sửa màu
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
    accent: "#8b5cf6", // Sửa màu
    border: "border-purple-500/20",
  },
  "Dự Trưởng": {
    bg: "from-rose-500/10 to-red-600/5",
    accent: "#ef4444",
    border: "border-rose-500/20",
  },
};

// ============================================================
// Delete Class Modal
// ============================================================
function DeleteClassModal({
  cls,
  onConfirm,
  onCancel,
  loading,
}: {
  cls: ClassInfo;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const isValid = confirmText === cls.class_name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-red-500/30 p-6"
        style={{ background: "rgba(15,3,3,0.98)" }}
      >
        <p className="text-3xl text-center mb-3">🗑️</p>
        <h3 className="text-white font-black text-center text-lg mb-1">
          Xóa lớp
        </h3>
        <p className="text-white/50 text-sm text-center mb-4">
          Bạn sắp xóa lớp{" "}
          <span className="text-white font-bold">{cls.class_name}</span> gồm{" "}
          <span className="text-red-400 font-bold">
            {cls.total_students} thiếu nhi
          </span>
          .
          <br />
          <span className="text-red-400 text-xs font-semibold">
            Toàn bộ học sinh và lịch sử điểm danh sẽ bị xóa vĩnh viễn!
          </span>
        </p>

        {/* Confirm bằng cách gõ tên lớp */}
        <div className="mb-5">
          <p className="text-white/40 text-xs mb-2 text-center">
            Gõ{" "}
            <span className="text-white font-mono font-bold">
              "{cls.class_name}"
            </span>{" "}
            để xác nhận
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={cls.class_name}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-red-500/50 text-center font-mono"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid || loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ?
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xóa...
              </span>
            : "Xóa lớp"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Class Card with delete button
// ============================================================
function ClassCardWithDelete({
  cls,
  theme,
  isSuperAdmin,
  onClick,
  onDeleteClick,
}: {
  cls: ClassInfo;
  theme: { bg: string; accent: string; border: string };
  isSuperAdmin: boolean;
  onClick: () => void;
  onDeleteClick: () => void;
}) {
  return (
    <div className="relative group">
      {/* Card gốc */}
      <div onClick={onClick} className="cursor-pointer">
        <ClassCard cls={cls} theme={theme} onClick={onClick} />
      </div>

      {/* Nút xóa - hover mới hiện, góc trên phải */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isSuperAdmin) return; // UI feedback: không làm gì nếu không phải SUPER_ADMIN
          onDeleteClick();
        }}
        title={
          isSuperAdmin ? "Xóa lớp này" : "Chỉ Super Admin mới xóa được lớp"
        }
        className={`
          absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm
          border transition-all
          opacity-0 group-hover:opacity-100
          ${
            isSuperAdmin ?
              "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50 cursor-pointer"
            : "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
          }
        `}
      >
        🗑
      </button>

      {/* Badge "chỉ admin" khi hover mà không phải SUPER_ADMIN */}
      {!isSuperAdmin && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm text-white/20">
            🔒
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function ClassesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupByNganh, setGroupByNganh] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<ClassInfo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    api
      .get("/leaderboard/classes")
      .then((res) => setClasses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(
        `/leaderboard/classes/${encodeURIComponent(deleteTarget.class_name)}`,
      );
      // Xóa khỏi state
      setClasses((prev) =>
        prev.filter((c) => c.class_name !== deleteTarget.class_name),
      );
      showToast(
        res.data.message || `Đã xóa lớp ${deleteTarget.class_name}!`,
        "success",
      );
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Xóa lớp thất bại!", "error");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

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
          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl max-w-xs ${
                toast.type === "success" ?
                  "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : "bg-red-500/20 border border-red-500/40 text-red-400"
              }`}
            >
              {toast.type === "success" ? "✅" : "❌"} {toast.msg}
            </div>
          )}

          {/* Delete modal */}
          {deleteTarget && (
            <DeleteClassModal
              cls={deleteTarget}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDeleteTarget(null)}
              loading={deleteLoading}
            />
          )}

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                🏫 Danh sách lớp
              </h1>
              <p className="text-white/40 text-sm mt-1">
                {user?.class_name ?
                  `Lớp ${user.class_name}`
                : `${classes.length} lớp · ${classes.reduce((s, c) => s + c.total_students, 0)} thiếu nhi`
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

          {/* Chú thích xóa lớp cho SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-500/5 border border-red-500/15 text-red-400/70 text-xs flex items-center gap-2">
              <span>💡</span>
              <span>
                Hover vào card lớp để thấy nút xóa. Xóa lớp sẽ xóa toàn bộ học
                sinh và lịch sử điểm danh.
              </span>
            </div>
          )}

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
                        <ClassCardWithDelete
                          key={cls.class_name}
                          cls={cls}
                          theme={theme}
                          isSuperAdmin={isSuperAdmin}
                          onClick={() => handleClickClass(cls.class_name)}
                          onDeleteClick={() => setDeleteTarget(cls)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            // Flat list
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classes.map((cls) => {
                const theme = NGANH_COLORS[cls.nganh] || {
                  bg: "from-gray-500/10 to-gray-600/5",
                  accent: "#6b7280",
                  border: "border-gray-500/20",
                };
                return (
                  <ClassCardWithDelete
                    key={cls.class_name}
                    cls={cls}
                    theme={theme}
                    isSuperAdmin={isSuperAdmin}
                    onClick={() => handleClickClass(cls.class_name)}
                    onDeleteClick={() => setDeleteTarget(cls)}
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
