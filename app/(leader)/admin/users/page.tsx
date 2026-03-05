"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuth, UserRole } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute/page"; // Sửa lại đường dẫn trong thư mục

interface ManagedUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  class_name?: string;
  created_at: string;
  permissions: string[];
}

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: "SUPER_ADMIN", label: "👑 Super Admin", color: "#f59e0b" },
  { value: "XU_DOAN_TRUONG", label: "🌟 Xứ Đoàn Trưởng", color: "#3b82f6" },
  { value: "XU_DOAN_PHO", label: "⭐ Xứ Đoàn Phó", color: "#8b5cf6" },
  { value: "TRUONG_TRUC", label: "🔷 Trưởng Trực", color: "#10b981" },
  { value: "TRUONG_LOP", label: "📚 Trưởng Lớp", color: "#6b7280" },
];

const CLASS_OPTIONS = [
  "Khai tâm 1",
  "Khai tâm 2",
  "Rước Lễ 1",
  "Rước Lễ 2",
  "Thêm sức 1",
  "Thêm sức 2",
  "Thêm sức 3",
  "Bao đồng 1",
  "Bao đồng 2",
  "Bao đồng 3",
  "Bao đồng 4",
  "Vào đời 1",
  "Vào đời 2",
];

interface UserData {
  id: number;
  full_name: string;
  email: string;
  role: string;
  class_name: string | null;
  created_at: string;
  permissions?: string[];
}

function roleColor(role: string) {
  return ROLES.find((r) => r.value === role)?.color ?? "#6b7280";
}

function roleLabel(role: string) {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

const inputCls =
  "w-fill rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-white/20 text-sm outlinbe-none focus:border-white/30 transition-all";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-white/50 text-xs font-semibold mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

// Edit Role Modal
// Dùng PUT /auth/users/:id/role { role, class_name }
function EditUserModal({
  user: target,
  actorRole,
  onSave,
  onCancel,
  loading,
}: {
  user: UserData;
  actorRole: string;
  onSave: (data: { role: string; class_name: string | null }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [role, setRole] = useState(target.role);
  const [className, setClassName] = useState(target.class_name ?? "");

  // XU_DOAN_TRUONG/PHO không được gán SUPER_ADMIN hoặc modify SUPER_ADMIN
  const isSuperAdmin = actorRole === "SUPER_ADMIN";
  const targetIsSA = target.role === "SUPER_ADMIN";
  const availableRoles =
    isSuperAdmin ? ROLES : ROLES.filter((r) => r.value !== "SUPER_ADMIN");

  if (!isSuperAdmin && targetIsSA) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl border-red-500/20 p-6 text-center"
          style={{ background: "rgba(10,14,25,0.99)" }}
        >
          <p className="text-3xl mb-3"></p>
          <p className="text-white font-bold mb-2">Không có quyền</p>
          <p className="text-white/40 text-sm mb-5">
            Chỉ Super Admin mới có thể sửa tài khoản Super admin khác
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 p-6 overflow-y-autp max-h-[90vh]"
        style={{ background: "rgba(8,12,20,0.99)" }}
      >
        <h3 className="text-white font-black text-lg mb-1">
          Chỉnh sửa vai trò
        </h3>
        <p className="text-white/30 text-xs mb-1">{target.full_name}</p>
        <p className="text-white/20 text-xs mb-5">{target.email}</p>

        <div className="space-y-4">
          {/* Chọn role */}
          <Field label="Vai trò">
            <div className="flex flex-col gap-1.5">
              {availableRoles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setRole(r.value);
                    // Reset lớp nếu đổi TRUONG_LOP
                    if (r.value !== "TRUONG_LOP") setClassName("");
                  }}
                  className="flex item-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all text-sm"
                  style={
                    role === r.value ?
                      {
                        borderColor: r.color,
                        backgroundColor: `${r.color}18`,
                        color: "#fff",
                      }
                    : {
                        borderColor: "rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        color: "rgba(255,255,255,0.45)",
                      }
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  {r.label}
                  {role === r.value && (
                    <span
                      className="ml-auto text-xs font-bold"
                      style={{ color: r.color }}
                    >
                      Chọn
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Field>

          {/* Lớp phụ trách - chỉ hiện khi chọn TRUONG_LOP */}
          {role === "TRUONG_LOP" && (
            <Field label="Lớp phụ trách">
              {/* <input value={className} placeholder="VD: Thêm sức 1" /> */}
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-xl bg-white/25 border border-white/25 px-4 py-3 text-white text-sm outline-none focus:border-white/60 focus:bg-white/30 transition-all appearance-none"
                style={{ colorScheme: "dark" }}
              >
                <option value="" disabled className="bg-indigo-900">
                  Chọn lớp của bạn...
                </option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls} className="bg-indigo-900">
                    {cls}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <p className="text-white/20 text-xs mt-4 mb-5">
          * Để đổi tên, email hoặc mật khẩu - Vui lòng liên hệ ADMIN
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
            onClick={() =>
              onSave({
                role,
                class_name:
                  role === "TRUONG_LOP" ? className.trim() || null : null,
              })
            }
            disabled={loading || (role === "TRUONG_LOP" && !className.trim())}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ?
              <span className="flex items-center justifyt-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu....
              </span>
            : "Lưu vai trò"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add user modal
function AddUserModal({
  actorRole,
  onSuccess,
  onCancel,
}: {
  actorRole: string;
  onSuccess: (user: UserData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "TRUONG_LOP",
    class_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSuperAdmin = actorRole === "SUPER_ADMIN";
  const availableRoles =
    isSuperAdmin ? ROLES : ROLES.filter((r) => r.value !== "SUPER_ADMIN");

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password)
      return setError("Vui Lòng điền đầy đủ thông tin!");
    if (form.password.length < 5)
      return setError("Mật khẩu tối thiểu 5 ký tự!");
    if (form.role === "TRUONG_LOP" && !form.class_name.trim())
      return setError("Trưởng lớp cần điền lớp phụ trách!");

    setLoading(true);
    setError("");
    try {
      // POST /auth/register -- lớp với register controller
      const res = await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        class_name: form.role === "TRUONG_LOP" ? form.class_name.trim() : null,
      });

      // register trả {message, user: safeUser}
      onSuccess(res.data.user);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.response?.data?.error;
      setError(msg || "Tạo tài khoản thất bại!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 p-6 overflow-y-auto max-h-[90vh]"
        style={{ background: "rgba(8,12,20,0.99)" }}
      >
        <h3 className="text-white font-black text-lg mb-5">Thêm tài khoản</h3>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Họ và tên">
            <input
              value={form.full_name}
              placeholder="Nguyễn Văn A"
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              placeholder="example@gmail.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              value={form.password}
              placeholder="Tối thiểu 5 ký tự"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Vai trò">
            <div className="flex flex-col gap-1.5">
              {availableRoles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      role: r.value,
                      class_name:
                        r.value !== "TRUONG_LOP" ? "" : form.class_name,
                    });
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all text-sm"
                  style={
                    form.role === r.value ?
                      {
                        borderColor: r.color,
                        backgroundColor: `${r.color}18`,
                        color: "#fff",
                      }
                    : {
                        borderColor: "rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        color: "rgba(255,255,255,0.45)",
                      }
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  {r.label}
                  {form.role === r.value && (
                    <span
                      className="ml-auto text-xs font-bold"
                      style={{ color: r.color }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Field>
          {form.role === "TRUONG_LOP" && (
            <Field label="Lớp phụ trách">
              <select
                value={form.class_name}
                onChange={(e) =>
                  setForm({ ...form, class_name: e.target.value })
                }
                className="w-full rounded-xl bg-white/25 border border-white/25 px-4 py-3 text-white text-sm outline-none focus:border-white/60 focus:bg-white/30 transition-all appearance-none"
                style={{ colorScheme: "dark" }}
              >
                <option value="" disabled className="bg-indigo-900">
                  Chọn lớp của bạn...
                </option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls} className="bg-indigo-900">
                    {cls}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 disabled:opacity-50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete user modal
function DeleteUserModal({
  user: target,
  onConfirm,
  onCancel,
  loading,
}: {
  user: UserData;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-red-500/20 p-6"
        style={{ background: "rgba(15,3,3,0.97)" }}
      >
        <p className="text-3xl text-center mb-3"></p>
        <h3 className="text-white font-black text-center text-lg mb-2">
          Xóa tài khoản
        </h3>
        <p className="text-white/50 text-sm text-center mb-1">
          Bạn chắc chắn muốn xóa tài khoản của
        </p>
        <p className="text-white font-bold text-center text-base mb-1">
          {target.full_name}
        </p>
        <p className="text-white/30 text-xs text-center mb-5">{target.email}</p>
        <p className="text-red-400 text-xs text-center mb-6 font-semibold">
          Hành động này không thể hoàn tác!
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 disabled:opacity-50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 disabled:opacity-50 transition-all"
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

export default function UserAdminPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const [addModal, setAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<UserData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Quyền theo RBAC thực tế:
  // - canAdd: SUPER_ADMIN + XU_DOAN_TRUONG + XU_DOAN_PHO (theo register endpoint không có auth guard)
  // - canEdit: SUPER_ADMIN + XU_DOAN_TRUONG (PUT /auth/users/:id/role)
  // - canDelete: chỉ SUPER_ADMIN (DELETE /auth/users/:id)
  const myRole = me?.role ?? "";
  const canAdd = ["SUPER_ADMIN", "XU_DOAN_TRUONG", "XU_DOAN_PHO"].includes(
    myRole,
  );
  const canEdit = ["SUPER_ADMIN", "XU_DOAN_TRUONG"].includes(myRole);
  const canDelete = myRole === "SUPER_ADMIN";

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // GET /auth/users trả array trực tiếp (không bọc { data })
    api
      .get("/auth/users")
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // PUT /auth/users/:id/role { role, class_name }
  const handleEditSave = async (data: {
    role: string;
    class_name: string | null;
  }) => {
    if (!editTarget) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/auth/users/${editTarget.id}/role`, data);
      // Response: { message, user, new_permissions }
      const updated: UserData = res.data.user;
      setUsers((prev) =>
        prev.map((u) => (u.id === editTarget.id ? { ...u, ...updated } : u)),
      );
      showToast(
        `Đã cập nhật vai trò thành ${roleLabel(data.role)}!`,
        "success",
      );
      setEditTarget(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error;
      showToast(msg || "Cập nhật thất bại!", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE /auth/users/:id
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/auth/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showToast(`Đã xóa tài khoản ${deleteTarget.full_name}!`, "success");
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error;
      showToast(msg || "Xóa thất bại!", "error");
      setDeleteTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#080c14] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
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

          {/* Modals */}
          {addModal && me && (
            <AddUserModal
              actorRole={me.role}
              onSuccess={(newUser) => {
                setUsers((prev) => [newUser, ...prev]);
                setAddModal(false);
                showToast("Tạo tài khoản thành công!", "success");
              }}
              onCancel={() => setAddModal(false)}
            />
          )}
          {editTarget && me && (
            <EditUserModal
              user={editTarget}
              actorRole={me.role}
              onSave={handleEditSave}
              onCancel={() => setEditTarget(null)}
              loading={actionLoading}
            />
          )}
          {deleteTarget && (
            <DeleteUserModal
              user={deleteTarget}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDeleteTarget(null)}
              loading={actionLoading}
            />
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black">👥 Quản lý tài khoản</h1>
              <p className="text-white/40 text-sm mt-1">
                {users.length} tài khoản trong hệ thống
              </p>
            </div>
            {canAdd && (
              <button
                onClick={() => setAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                + Thêm tài khoản
              </button>
            )}
          </div>

          {/* Permission info bar */}
          <div className="mb-5 px-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-xs flex flex-wrap gap-x-5 gap-y-1">
            <span className="text-red-400">🔴 Super Admin — toàn quyền</span>
            <span className="text-amber-400">
              🟡 Xứ Đoàn Trưởng — thêm & sửa vai trò
            </span>
            <span className="text-orange-400">🟠 Xứ Đoàn Phó — chỉ thêm</span>
            <span className="text-white/30">⚪ Role khác — chỉ xem</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Tìm tên hoặc email..."
              className="flex-1 min-w-48 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-white/30 text-sm"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm outline-none"
            >
              <option value="ALL">Tất cả vai trò</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ?
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          : <div
              className="rounded-2xl overflow-hidden border border-white/8"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-4 py-3 text-left text-xs text-white/30 font-semibold uppercase">
                      Tên
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-white/30 font-semibold uppercase hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-white/30 font-semibold uppercase">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-white/30 font-semibold uppercase hidden md:table-cell">
                      Lớp
                    </th>
                    <th className="px-4 py-3 w-24 text-right text-xs text-white/30 font-semibold uppercase pr-5">
                      {canEdit || canDelete ? "Thao tác" : ""}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const color = roleColor(u.role);
                    const isMe = u.id === me?.id;
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-white font-semibold text-sm flex items-center gap-2">
                            {u.full_name}
                            {isMe && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-normal">
                                Bạn
                              </span>
                            )}
                          </p>
                          {/* Email hiện trong row trên mobile */}
                          <p className="text-white/30 text-xs sm:hidden">
                            {u.email}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-white/40 text-sm hidden sm:table-cell">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ backgroundColor: `${color}18`, color }}
                          >
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-white/40 text-sm hidden md:table-cell">
                          {u.class_name ?? (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Nút sửa — SUPER_ADMIN + XU_DOAN_TRUONG */}
                            {canEdit && (
                              <button
                                onClick={() => setEditTarget(u)}
                                className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 hover:border-blue-500/40 transition-all flex items-center justify-center text-xs"
                                title="Đổi vai trò"
                              >
                                ✏️
                              </button>
                            )}
                            {/* Nút xóa — chỉ SUPER_ADMIN, không tự xóa mình */}
                            {canDelete && !isMe && (
                              <button
                                onClick={() => setDeleteTarget(u)}
                                className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:border-red-500/40 transition-all flex items-center justify-center text-xs"
                                title="Xóa tài khoản"
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-white/30">
                  <p className="text-3xl mb-2">👥</p>
                  <p>Không tìm thấy tài khoản nào</p>
                </div>
              )}
            </div>
          }
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Helper: permissions theo role (mirror backend)
function getDefaultPermissions(role: UserRole): string[] {
  const map: Record<UserRole, string[]> = {
    SUPER_ADMIN: [
      "students:read",
      "students:write",
      "students:delete",
      "checkins:read",
      "checkins:write",
      "activities:read",
      "activities:write",
      "activities:delete",
      "leaderboard:read",
      "ranking:read",
      "statistics:read",
      "statistics:advanced",
      "users:read",
      "users:write",
      "users:delete",
      "users:grant_role",
      "classes:read",
      "reports:read",
      "reports:export",
    ],
    XU_DOAN_TRUONG: [
      "students:read",
      "students:write",
      "checkins:read",
      "checkins:write",
      "activities:read",
      "activities:write",
      "leaderboard:read",
      "ranking:read",
      "statistics:read",
      "statistics:advanced",
      "users:read",
      "users:write",
      "classes:read",
      "reports:read",
      "reports:export",
    ],
    XU_DOAN_PHO: [
      "students:read",
      "students:write",
      "checkins:read",
      "checkins:write",
      "activities:read",
      "activities:write",
      "leaderboard:read",
      "ranking:read",
      "statistics:read",
      "users:read",
      "classes:read",
      "reports:read",
    ],
    TRUONG_TRUC: [
      "students:read",
      "checkins:read",
      "checkins:write",
      "activities:read",
      "leaderboard:read",
      "ranking:read",
      "statistics:read",
      "classes:read",
    ],
    TRUONG_LOP: [
      "students:read",
      "checkins:read",
      "checkins:write",
      "activities:read",
      "leaderboard:read",
      "classes:read_own",
      "statistics:read",
    ],
  };
  return map[role] || [];
}
