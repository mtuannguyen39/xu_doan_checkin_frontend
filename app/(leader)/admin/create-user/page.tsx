"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute/page";
import { api } from "@/lib/axios";
import { useState } from "react";

const ROLES = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    color: "#ef4444",
    desc: "Toàn quyền hệ thống",
  },
  {
    value: "XU_DOAN_TRUONG",
    label: "Xứ đoàn trưởng",
    color: "#f97316",
    desc: "Quản lý toàn xứ đoàn",
  },
  {
    value: "XU_DOAN_PHO",
    label: "Xứ đoàn phó",
    color: "#f97316",
    desc: "Hỗ trợ xứ đoàn trưởng",
  },
  {
    value: "TRUONG_TRUC",
    label: "Trưởng trực",
    color: "#f97316",
    desc: "Trực ban điểm danh",
  },
  {
    value: "TRUONG_LOP",
    label: "Trưởng lớp",
    color: "#f97316",
    desc: "Quản lý lớp cụ thể",
  },
];

interface FormState {
  full_name: string;
  email: string;
  password: string;
  role: string;
  class_name: string;
}

export default function CreateUserPage() {
  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    password: "",
    role: "TRUONG_LOP",
    class_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const selectedRole = ROLES.find((r) => r.value === form.role);
  const needsClass = form.role === "TRUONG_LOP";

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Vui lòng điền đầy đủ họ tên, email và mật khẩu!");
      return;
    }

    if (needsClass && !form.class_name.trim()) {
      setError("Trưởng lớp cần chọn lớp phụ trách!");
      return;
    }

    if (form.password.length < 5) {
      setError("Mật khẩu phải có ít nhất 5 ký tự");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        class_name: needsClass ? form.class_name.trim() : null,
      });

      setSuccess(
        `Đã tạo tài khoản cho ${form.full_name} (${selectedRole?.label}!)`,
      );
      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "TRUONG_LOP",
        class_name: "",
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.response?.data?.error;
      if (msg?.includes("exists") || error?.response?.status === 400) {
        setError("Email này đã được dùng rồi!");
      } else {
        setError(msg || "Tạo tài khoản thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={["SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#080c14] p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto mb-4">
              ICON
            </div>
            <h1 className="text-2xl font-black text-white">Tạo tài khoản</h1>
            <p className="text-white/40 text-sm mt-1">
              Thêm huynh trưởng mới vào hệ thống
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl border border-white/10 p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Alert */}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Họ và tên */}
              <Field label="Họ và tên">
                <input
                  value={form.full_name}
                  placeholder="Nguyễn Văn A"
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className={inputClass}
                />
              </Field>

              {/* Email */}
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  placeholder="example@email.com"
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass}
                />
              </Field>

              {/* Password */}
              <Field label="Mật khẩu">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    placeholder="Ít nhất 5 ký tự"
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={inputClass + " pr-12"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -transalge-y-1/2 text-white/40 hover:text-white/70 text-sm"
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </Field>

              {/* Role */}
              <Field label="Vai trò">
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleChange("role", role.value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${form.role === role.value ? "border-opacity-60 bg-opacity-15" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                      style={
                        form.role === role.value ?
                          {
                            borderColor: role.color,
                            backgroundColor: `${role.color}15`,
                          }
                        : {}
                      }
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">
                          {role.label}
                        </p>

                        <p className="text-white/40 text-xs">{role.desc}</p>
                      </div>
                      {form.role === role.value && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: role.color }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Class (chỉ hiện khi role hiện đang là TRUONG_LOP) */}
              {needsClass && (
                <Field label="Lớp phụ trách">
                  <input
                    value={form.class_name}
                    placeholder="VD: Thêm sức 2, Rước lễ 1,..."
                    onChange={(e) => handleChange("class_name", e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-white/30 text-xs mt-1.5">
                    Trưởng lớp chỉ thấy và điểm danh được học sinh trong lớp này
                  </p>
                </Field>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl font-black text-sm transition-all disabled:opactiy-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedRole?.color || "#f59e0b",
                color: "#000",
              }}
            >
              {loading ?
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20" />
                  Đang tạo...
                </span>
              : `Tạo ${selectedRole?.label}`}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

const inputClass =
  "w-ful rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-white/30 focus:bg-white/8 transition-all";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-white/60 text-xs font-semibold mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
