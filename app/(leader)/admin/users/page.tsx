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

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("TRUONG_LOP");
  const [editClass, setEditClass] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    api
      .get("/auth/users")
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveRole = async (userId: number) => {
    setSaving(true);
    try {
      await api.put(`/auth/users/${userId}/role`, {
        role: editRole,
        class_name: editClass || null,
      });
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      alert("Lỗi khi cập nhật role!");
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const getRoleInfo = (role: UserRole) =>
    ROLES.find((r) => r.value === role) || { label: role, color: "#6b7280" };
  return (
    <ProtectedRoute roles={["SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#080c14] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black flex items-center gap-2">
              👑 Quản lý tài khoản
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Cấp quyền động cho huynh trưởng · {users.length} tài khoản
            </p>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm tên, email..."
            className="w-full mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-amber-500/50 text-sm"
          />

          {loading ?
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
            </div>
          : <div className="space-y-3">
              {filtered.map((u) => {
                const roleInfo = getRoleInfo(u.role);
                const isEditing = editingId === u.id;
                const isSelf = u.id === currentUser?.id;

                return (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-white/10 p-5 transition-all"
                    style={{
                      background:
                        isEditing ?
                          "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white">{u.full_name}</p>
                          {isSelf && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                              Bạn
                            </span>
                          )}
                        </div>
                        <p className="text-white/40 text-sm">{u.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${roleInfo.color}20`,
                              color: roleInfo.color,
                            }}
                          >
                            {roleInfo.label}
                          </span>
                          {u.class_name && (
                            <span className="text-xs text-white/40">
                              📚 {u.class_name}
                            </span>
                          )}
                          <span className="text-xs text-white/30">
                            {u.permissions.length} quyền
                          </span>
                        </div>
                      </div>

                      {/* Edit button */}
                      {!isSelf && (
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingId(null);
                            } else {
                              setEditingId(u.id);
                              setEditRole(u.role);
                              setEditClass(u.class_name || "");
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-white/8 border border-white/10 text-white/60 text-sm hover:bg-white/12 transition-colors shrink-0"
                        >
                          {isEditing ? "Huỷ" : "✏️ Phân quyền"}
                        </button>
                      )}
                    </div>

                    {/* Edit panel */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="text-white/50 text-xs mb-1.5 block">
                              Role mới
                            </label>
                            <select
                              value={editRole}
                              onChange={(e) =>
                                setEditRole(e.target.value as UserRole)
                              }
                              className="w-full px-3 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white text-sm outline-none"
                            >
                              {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-white/50 text-xs mb-1.5 block">
                              Lớp phụ trách{" "}
                              {editRole !== "TRUONG_LOP" && (
                                <span className="text-white/25">
                                  (tuỳ chọn)
                                </span>
                              )}
                            </label>
                            <input
                              value={editClass}
                              onChange={(e) => setEditClass(e.target.value)}
                              placeholder="VD: Thiếu 2"
                              className="w-full px-3 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/25 text-sm outline-none focus:border-amber-500/50"
                            />
                          </div>
                        </div>

                        {/* Permissions preview */}
                        <div className="mb-4">
                          <p className="text-white/40 text-xs mb-2">
                            Quyền sẽ có sau khi cập nhật:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(ROLES.find((r) => r.value === editRole) ?
                              getDefaultPermissions(editRole)
                            : []
                            ).map((perm) => (
                              <span
                                key={perm}
                                className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSaveRole(u.id)}
                          disabled={saving}
                          className="px-6 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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
