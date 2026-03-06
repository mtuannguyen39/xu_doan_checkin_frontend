"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute/page";
import { QRModal } from "@/components/QRModal";

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
    created_at: string | null;
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

// ============================================================
// Attendance circle
// ============================================================
function AttendanceDots({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? "#10b981"
    : rate >= 60 ? "#f59e0b"
    : rate >= 40 ? "#f97316"
    : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 36 36" className="rotate-90 w-8 h-8">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(rate / 100) * 94.25} 94.25`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
          style={{ color }}
        >
          {rate}
        </span>
      </div>
      <span className="text-xs text-white/40">%</span>
    </div>
  );
}

// ============================================================
// Edit Modal
// ============================================================
function EditModal({
  student,
  onSave,
  onCancel,
  loading,
}: {
  student: Student;
  onSave: (data: {
    full_name: string;
    saint_name: string;
    phone: string;
    is_active: boolean;
  }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    full_name: student.full_name,
    saint_name: student.saint_name,
    phone: student.phone || "",
    is_active: student.is_active,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/15 p-6"
        style={{ background: "rgba(10,14,25,0.98)" }}
      >
        <h3 className="text-white font-black text-lg mb-1">✏️ Chỉnh sửa</h3>
        <p className="text-white/40 text-xs mb-5">
          ID: {student.id} · Lớp {student.class_name}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">
              Họ và tên
            </label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">
              Tên Thánh
            </label>
            <input
              value={form.saint_name}
              onChange={(e) => setForm({ ...form, saint_name: e.target.value })}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">
              Số điện thoại
            </label>
            <input
              value={form.phone}
              placeholder="Không bắt buộc"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-white text-sm font-semibold">Trạng thái</p>
              <p className="text-white/40 text-xs">
                Thiếu nhi có đang hoạt động?
              </p>
            </div>
            <button
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-emerald-500" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x" : "-translate-x-5"}`}
              />
            </button>
          </div>
        </div>

        <p className="text-white/20 text-xs mt-4 mb-5">
          * Không thể đổi lớp, ngành hoặc ID qua form này
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={
              loading || !form.full_name.trim() || !form.saint_name.trim()
            }
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {loading ?
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </span>
            : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Delete Modal
// ============================================================
function DeleteModal({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-red-500/20 p-6"
        style={{ background: "rgba(15,3,3,0.97)" }}
      >
        <p className="text-3xl text-center mb-3">⚠️</p>
        <h3 className="text-white font-black text-center text-lg mb-2">
          Xác nhận xóa
        </h3>
        <p className="text-white/50 text-sm text-center mb-6">
          Bạn có chắc muốn xóa{" "}
          <span className="text-white font-semibold">{name}</span>?
          <br />
          <span className="text-red-400 text-xs">
            Toàn bộ lịch sử điểm danh sẽ bị xóa vĩnh viễn!
          </span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {loading ?
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xóa...
              </span>
            : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Student Row
// ============================================================
function StudentRow({
  student,
  canEdit,
  onEdit,
  onDelete,
  onShowQR,
}: {
  student: Student;
  canEdit: boolean;
  onEdit: (s: Student) => void;
  onDelete: (id: string, name: string) => void;
  onShowQR: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="px-4 py-3 text-center">
          <span
            className={`text-sm font-bold ${student.rank <= 3 ? "text-amber-400" : "text-white/30"}`}
          >
            #{student.rank}
          </span>
        </td>
        <td
          className="px-4 py-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <p className="font-semibold text-white text-sm">
            {student.full_name}
            {!student.is_active && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                Ngưng HĐ
              </span>
            )}
          </p>
          <p className="text-white/40 text-xs">
            {student.saint_name} · {student.id}
          </p>
        </td>
        <td
          className="px-4 py-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <AttendanceDots rate={student.attendance_rate} />
        </td>
        <td
          className="px-4 py-3 text-center cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="font-bold text-white">{student.total_checkins}</span>
          <p className="text-white/30 text-xs">buổi</p>
        </td>
        <td
          className="px-4 py-3 text-center cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="font-bold text-blue-400">
            {student.total_points}
          </span>
          <p className="text-white/30 text-xs">điểm</p>
        </td>
        <td
          className="px-4 py-3 text-center cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
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
        {/* Action buttons */}
        <td className="px-3 py-3">
          <div className="flex items-center justify-end gap-1.5">
            {canEdit && (
              <>
                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(student);
                  }}
                  className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 hover:border-blue-500/40 transition-all flex items-center justify-center text-xs cursor-pointer"
                  title="Chỉnh sửa"
                >
                  ✏️
                </button>
                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(student.id, student.full_name);
                  }}
                  className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:border-red-500/40 transition-all flex items-center justify-center text-xs cursor-pointer"
                  title="Xóa"
                >
                  🗑
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowQR(student.id);
              }}
              className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400
                hover:bg-purple-500/25 transition-all flex items-center justify-center text-xs cursor-pointer"
              title="Lấy lại QR"
            >
              📱
            </button>
            <span
              className={`text-white/30 text-xs transition-transform inline-block cursor-pointer ${expanded ? "rotate-180" : ""}`}
              onClick={() => setExpanded(!expanded)}
            >
              ▼
            </span>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-white/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.recent_checkins.map((c, i) => (
                <div key={i} className="rounded-xl bg-white/5 p-3">
                  <p className="text-white/60 text-xs mb-2">
                    📅{" "}
                    {new Date(c.date).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                    {c.created_at && (
                      <span className="ml-1.5 text-white/30">
                        {new Date(c.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Ho_Chi_Minh",
                        })}
                      </span>
                    )}
                    <span className="ml-2 font-bold text-amber-400">
                      +{c.point} điểm
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.activities.map((a, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300"
                      >
                        {a.name} +{a.point}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {student.recent_checkins.length === 0 && (
                <p className="text-white/30 text-sm col-span-2">
                  Chưa có lịch sử điểm danh
                </p>
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

// ============================================================
// Main Page
// ============================================================
export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const className = decodeURIComponent(params.class_name as string);

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "checkins">("rank");

  const [qrTarget, setQrTarget] = useState<{ id: string; name: string } | null>(
    null,
  );

  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // SUPER_ADMIN và TRUONG_LOP mới có nút edit/delete
  const canEdit = user?.role === "SUPER_ADMIN" || user?.role === "TRUONG_LOP";

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api
      .get(`/leaderboard/classes/${encodeURIComponent(className)}`)
      .then((res) => {
        setClassData(res.data.class);
        setStudents(res.data.students);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [className]);

  const handleEditSave = async (data: {
    full_name: string;
    saint_name: string;
    phone: string;
    is_active: boolean;
  }) => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const res = await api.patch(`/students/${editTarget.id}`, data);
      const updated = res.data.data;
      // Cập nhật state local
      setStudents((prev) =>
        prev.map((s) => (s.id === editTarget.id ? { ...s, ...updated } : s)),
      );
      showToast("Cập nhật thành công!", "success");
      setEditTarget(null);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Cập nhật thất bại!", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/students/${deleteTarget.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showToast(`Đã xóa ${deleteTarget.name} thành công!`, "success");
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Xóa thất bại!", "error");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = students
    .filter(
      (s) =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.saint_name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()),
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
          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl ${
                toast.type === "success" ?
                  "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : "bg-red-500/20 border border-red-500/40 text-red-400"
              }`}
            >
              {toast.type === "success" ? "✅" : "❌"} {toast.msg}
            </div>
          )}

          {/* QR Modal */}
          {qrTarget && (
            <QRModal
              studentId={qrTarget.id}
              onClose={() => setQrTarget(null)}
            />
          )}

          {/* Edit modal */}
          {editTarget && (
            <EditModal
              student={editTarget}
              onSave={handleEditSave}
              onCancel={() => setEditTarget(null)}
              loading={editLoading}
            />
          )}

          {/* Delete modal */}
          {deleteTarget && (
            <DeleteModal
              name={deleteTarget.name}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDeleteTarget(null)}
              loading={deleteLoading}
            />
          )}

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Quay lại
          </button>

          {loading ?
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          : <>
              {classData && (
                <div className="rounded-2xl bg-linear-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/20 p-6 mb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-white">
                        {classData.class_name}
                      </h1>
                      <p className="text-blue-400 font-medium mt-1">
                        {classData.nganh}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard
                        label="Thiếu nhi"
                        value={students.length}
                        unit=""
                      />
                      <StatCard
                        label="Buổi SH"
                        value={classData.total_sessions}
                        unit=""
                      />
                      <StatCard
                        label="TB chuyên cần"
                        value={classData.avg_attendance_rate}
                        unit="%"
                        color="text-emerald-400"
                      />
                      <StatCard
                        label="Tổng điểm"
                        value={classData.total_points}
                        unit="đ"
                        color="text-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

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

              <div
                className="rounded-2xl overflow-hidden border border-white/8"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase w-12">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase">
                          Học sinh
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase">
                          Chuyên cần
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/30 uppercase">
                          Buổi ĐD
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/30 uppercase">
                          Điểm
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/30 uppercase">
                          5 buổi gần nhất
                        </th>
                        <th className="px-3 py-3 w-24 text-right text-xs font-semibold text-white/30 uppercase">
                          {canEdit ? "Thao tác" : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((student) => (
                        <StudentRow
                          key={student.id}
                          student={student}
                          canEdit={canEdit}
                          onEdit={setEditTarget}
                          onDelete={(id, name) => setDeleteTarget({ id, name })}
                          onShowQR={(id) =>
                            setQrTarget({ id, name: student.full_name })
                          }
                        />
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
          }
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({
  label,
  value,
  unit,
  color = "text-white",
}: {
  label: string;
  value: number;
  unit: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>
        {value.toLocaleString()}
        <span className="text-sm font-normal ml-0.5">{unit}</span>
      </p>
    </div>
  );
}
