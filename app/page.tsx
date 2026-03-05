"use client";

import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NGANH_OPTIONS = [
  "Chiên Con",
  "Ấu nhi",
  "Thiếu Nhi",
  "Nghĩa Sĩ",
  "Dự Trưởng",
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

export default function StudentLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    saint_name: "",
    class_name: "",
    nganh: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Nếu đã đăng ký rồi thì vào thẳng trang QR
  useEffect(() => {
    const saved = localStorage.getItem("student");
    if (saved) router.replace("/student/qr");
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (
      !form.full_name.trim() ||
      !form.saint_name.trim() ||
      !form.class_name.trim() ||
      !form.nganh
    ) {
      setError("Vui lòng điền đầy đủ tất cả thông tin!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/students/register", {
        full_name: form.full_name.trim(),
        saint_name: form.saint_name.trim(),
        class_name: form.class_name.trim(),
        nganh: form.nganh,
      });

      // Lưu data student (gồm qr_code UUID) vào localStorage
      localStorage.setItem("student", JSON.stringify(res.data.data));
      router.push("/student/qr");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message;
      setError(msg || "Đăng ký thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 p-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl mx-auto mb-4 border border-white/30">
            ✝️
          </div>
          <h1 className="text-2xl font-black text-white">Xin chào!</h1>
          <p className="text-white/70 text-sm mt-1">
            Nhập thông tin để nhận mã QR điểm danh của bạn
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 p-8 shadow-2xl">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="text-white/80 text-xs font-semibold mb-1.5 block">
                Họ và tên
              </label>
              <input
                value={form.full_name}
                placeholder="Nguyễn Văn A"
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="w-full rounded-xl bg-white/25 border border-white/25 px-4 py-3 text-white placeholder-white/40 text-sm outline-none focus:border-white/60 focus:bg-white/30 transition-all"
              />
            </div>

            {/* Tên Thánh */}
            <div>
              <label className="text-white/80 text-xs font-semibold mb-1.5 block">
                Tên Thánh
              </label>
              <input
                value={form.saint_name}
                placeholder="Giuse, Maria, Phêrô..."
                onChange={(e) => handleChange("saint_name", e.target.value)}
                className="w-full rounded-xl bg-white/25 border border-white/25 px-4 py-3 text-white placeholder-white/40 text-sm outline-none focus:border-white/60 focus:bg-white/30 transition-all"
              />
            </div>

            {/* Lớp */}
            <div>
              <label className="text-white/80 text-xs font-semibold mb-1.5 block">
                Lớp
              </label>
              {/* <input
                value={form.class_name}
                placeholder="VD: Thiếu 2, Ấu 1..."
                onChange={(e) => handleChange("class_name", e.target.value)}
                className="w-full rounded-xl bg-white/25 border border-white/25 px-4 py-3 text-white placeholder-white/40 text-sm outline-none focus:border-white/60 focus:bg-white/30 transition-all"
              /> */}
              <select
                value={form.class_name}
                onChange={(e) => handleChange("class_name", e.target.value)}
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
            </div>

            {/* Ngành - dropdown */}
            <div>
              <label className="text-white/80 text-xs font-semibold mb-1.5 block">
                Ngành
              </label>
              <select
                value={form.nganh}
                onChange={(e) => handleChange("nganh", e.target.value)}
                className="w-full rounded-xl bg-white/25 border border-white/25 px-4 py-3 text-white text-sm outline-none focus:border-white/60 focus:bg-white/30 transition-all appearance-none"
                style={{ colorScheme: "dark" }}
              >
                <option value="" disabled className="bg-indigo-900">
                  Chọn ngành của bạn...
                </option>
                {NGANH_OPTIONS.map((n) => (
                  <option key={n} value={n} className="bg-indigo-900">
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 rounded-xl bg-white text-blue-600 py-3.5 font-black text-sm shadow-lg hover:bg-blue-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ?
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                Đang xử lý...
              </span>
            : "Lấy mã QR của tôi →"}
          </button>

          <p className="text-center text-white/40 text-xs mt-4">
            Mã QR sẽ được dùng mãi mãi để điểm danh 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
