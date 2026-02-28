"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

const NGANH_OPTIONS = [
  "Chiên Con",
  "Ấu nhi",
  "Thiếu Nhi",
  "Nghĩa Sĩ",
  "Dự Trưởng",
];

interface StudentForm {
  full_name: string;
  saint_name: string;
  class_name: string;
  nganh: string;
}

export default function StudentPage() {
  const router = useRouter();
  const [form, setForm] = useState<StudentForm>({
    full_name: "",
    saint_name: "",
    class_name: "",
    nganh: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: keyof StudentForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    // Validate
    if (
      !form.full_name.trim() ||
      !form.saint_name.trim() ||
      !form.class_name.trim() ||
      !form.nganh
    ) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // API tìm student theo thông tin, nếu chưa có thì tạo mới
      const res = await api.post("/students/register", {
        full_name: form.full_name.trim(),
        saint_name: form.saint_name.trim(),
        class_name: form.class_name.trim(),
        nganh: form.nganh,
      });

      // Lưu toàn bộ thông tin student vào localStorage
      // qr_code là UUID cố định, dùng mãi mãi làm ID điểm danh
      const studentData = res.data.data;
      localStorage.setItem("student", JSON.stringify(studentData));

      router.push("/student/qr");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message;

      // Nếu student đã tồn tại → thử lấy lại bằng cách lookup
      if (
        err?.response?.status === 409 ||
        msg?.includes("exists") ||
        msg?.includes("tồn tại")
      ) {
        setError(
          "Bạn đã đăng ký rồi! Vui lòng liên hệ huynh trưởng để lấy lại mã QR.",
        );
      } else {
        setError(msg || "Đăng ký thất bại, vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl mx-auto mb-4 border border-white/30">
            ✝️
          </div>
          <h1 className="text-2xl font-black text-white">Xin chào!</h1>
          <p className="text-white/70 text-sm mt-1">
            Nhập thông tin để nhận mã QR điểm danh
          </p>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white/15 backdrop-blur-xl border border-white/25 p-6 shadow-2xl">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Field
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={form.full_name}
              onChange={(v) => handleChange("full_name", v)}
            />

            <Field
              label="Tên Thánh"
              placeholder="Giuse, Maria, Phêrô..."
              value={form.saint_name}
              onChange={(v) => handleChange("saint_name", v)}
            />

            <Field
              label="Lớp"
              placeholder="Thiếu 2, Ấu 1..."
              value={form.class_name}
              onChange={(v) => handleChange("class_name", v)}
            />

            <div>
              <label className="text-white/80 text-xs font-semibold mb-1.5 block">
                Ngành
              </label>
              <select
                value={form.nganh}
                onChange={(e) => handleChange("nganh", e.target.value)}
                className="w-full rounded-xl bg-white/20 border border-white/25 px-4 py-3 text-white text-sm outline-none focus:border-white/60 focus:bg-white/25 transition-all"
              >
                <option value="" disabled className="text-gray-800">
                  Chọn ngành...
                </option>
                {NGANH_OPTIONS.map((n) => (
                  <option key={n} value={n} className="text-gray-800">
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 rounded-xl bg-white text-indigo-700 py-3.5 font-black text-sm shadow-lg hover:bg-white/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ?
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin" />
                Đang xử lý...
              </span>
            : "Lấy mã QR của tôi →"}
          </button>

          <p className="text-center text-white/50 text-xs mt-4">
            Mã QR sẽ được dùng mãi mãi để điểm danh
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-white/80 text-xs font-semibold mb-1.5 block">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-white/20 border border-white/25 px-4 py-3 text-white placeholder-white/40 text-sm outline-none focus:border-white/60 focus:bg-white/25 transition-all"
      />
    </div>
  );
}
