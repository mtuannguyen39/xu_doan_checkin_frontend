"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { api } from "@/lib/axios";

interface QRData {
  id: string;
  full_name: string;
  saint_name: string;
  class_name: string;
  nganh: string;
  qr_code: string;
}

const NGANH_COLORS: Record<string, string> = {
  "Chiên Con": "#f59e0b",
  "Ấu nhi": "#10b981",
  "Thiếu Nhi": "#6366f1",
  "Nghĩa Sĩ": "#8b5cf6",
  "Dự Trưởng": "#ef4444",
};

export function QRModal({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ useEffect — fetch khi modal mở
  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/students/qr/${studentId}`)
      .then((res) => setData(res.data.data))
      .catch((err) =>
        setError(err?.response?.data?.error || "Không thể lấy mã QR!"),
      )
      .finally(() => setLoading(false));
  }, [studentId]);

  // Tải ảnh QR về máy
  const handleDownload = () => {
    const canvas = document.getElementById(
      "qr-canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas || !data) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `QR_${data.full_name.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const nganhColor = data ? (NGANH_COLORS[data.nganh] ?? "#6366f1") : "#6366f1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-3xl border border-white/15 p-6 text-center"
        style={{ background: "rgba(8,12,20,0.99)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading */}
        {loading && (
          <div className="py-10 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-white/30 text-xs">Đang tải mã QR...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-8">
            <p className="text-4xl mb-3">❌</p>
            <p className="text-red-400 text-sm font-semibold">{error}</p>
            <p className="text-white/30 text-xs mt-2">
              Thử lại hoặc kiểm tra kết nối
            </p>
          </div>
        )}

        {/* QR */}
        {!loading && data && (
          <>
            {/* Ngành badge */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ backgroundColor: `${nganhColor}22`, color: nganhColor }}
            >
              {data.nganh}
            </span>

            {/* Tên */}
            <h3 className="text-white font-black text-lg leading-tight">
              {data.saint_name} {data.full_name}
            </h3>
            <p className="text-white/30 text-xs mt-1 mb-5">
              Lớp {data.class_name} ·{" "}
              <span className="font-mono">{data.id}</span>
            </p>

            {/* QR Code */}
            <div className="inline-block p-4 rounded-2xl bg-white shadow-2xl mb-4">
              <QRCodeCanvas
                id="qr-canvas"
                value={data.qr_code}
                size={192}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-white/25 text-[11px] mb-4 leading-relaxed">
              Gửi ảnh này cho thiếu nhi để dùng khi điểm danh
            </p>

            {/* Nút tải */}
            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl font-bold text-sm mb-3 transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: `${nganhColor}18`,
                border: `1px solid ${nganhColor}40`,
                color: nganhColor,
              }}
            >
              ⬇️ Tải ảnh QR về máy
            </button>
          </>
        )}

        {/* Đóng */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 font-semibold text-sm hover:bg-white/10 transition-all"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
