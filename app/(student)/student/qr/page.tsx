"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
  id: string;
  full_name: string;
  saint_name: string;
  class_name: string;
  nganh: string;
  qr_code: string; // UUID - đây là value của QR, huynh trưởng quét cái này
  is_active: boolean;
  created_at: string;
}

const NGANH_COLORS: Record<string, string> = {
  "Chiên Con": "#f59e0b",
  "Ấu nhi": "#10b981",
  "Thiếu Nhi": "#6366f1",
  "Nghĩa Sĩ": "#8b5cf6",
  "Dự Trưởng": "#ef4444",
};

export default function StudentQR() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [showId, setShowId] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("student");
    if (!data) {
      // Chưa đăng ký → về trang nhập thông tin
      router.replace("/student");
      return;
    }
    try {
      setStudent(JSON.parse(data));
    } catch {
      localStorage.removeItem("student");
      router.replace("/student");
    }
  }, []);

  const handleReset = () => {
    if (confirm("Bạn muốn đăng ký lại với thông tin khác?")) {
      localStorage.removeItem("student");
      router.push("/student");
    }
  };

  if (!student) return null;

  const nganhColor = NGANH_COLORS[student.nganh] || "#6b7280";

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${nganhColor}33 0%, #0f172a 50%, ${nganhColor}1a 100%)`,
        backgroundColor: "#0f172a",
      }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: nganhColor }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-3xl border border-white/15 p-8 text-center shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Ngành badge */}
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
            style={{ backgroundColor: `${nganhColor}30`, color: nganhColor }}
          >
            {student.nganh}
          </span>

          {/* Tên */}
          <h2 className="text-2xl font-black text-white mb-1">
            {student.saint_name} {student.full_name}
          </h2>
          <p className="text-white/50 text-sm mb-6">Lớp {student.class_name}</p>

          {/* QR Code */}
          <div className="inline-block p-4 rounded-2xl bg-white shadow-xl mb-6">
            {/* ✅ value = qr_code (UUID) — huynh trưởng quét cái này để checkin */}
            <QRCodeCanvas
              value={student.qr_code}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Student ID (ẩn mặc định, tap để xem) */}
          <button
            onClick={() => setShowId(!showId)}
            className="block w-full text-center"
          >
            {showId ?
              <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-2">
                <p className="text-white/40 text-xs mb-1">Mã học sinh</p>
                <p className="text-white font-mono font-bold text-sm">
                  {student.id}
                </p>
              </div>
            : <p className="text-white/30 text-xs hover:text-white/50 transition-colors">
                Nhấn để xem mã học sinh
              </p>
            }
          </button>

          {/* Hướng dẫn */}
          <div className="mt-6 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-white/60 text-xs leading-relaxed">
              📱 Cho huynh trưởng quét mã này để điểm danh. Mã QR này là của bạn{" "}
              <span className="text-white/90 font-semibold">mãi mãi</span>, hãy
              giữ cẩn thận!
            </p>
          </div>
        </div>

        {/* Đăng ký lại */}
        <button
          onClick={handleReset}
          className="w-full mt-4 py-3 text-white/30 text-xs hover:text-white/60 transition-colors"
        >
          Không phải bạn? Đăng ký lại
        </button>
      </div>
    </div>
  );
}
