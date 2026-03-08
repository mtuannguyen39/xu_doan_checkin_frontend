"use client";

/**
 * Trang quét QR điểm danh
 *
 * Fix iOS/Chrome:
 * 1. Dùng html5-qrcode thay @zxing/browser — hỗ trợ iOS tốt hơn nhiều
 *    npm install html5-qrcode
 * 2. Thêm debounce 3 giây để tránh quét 2 lần liên tiếp
 * 3. Xin quyền camera đúng cách theo chuẩn iOS
 */

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute/page";
import { useRouter } from "next/navigation";

interface ScanResult {
  type: "success" | "error" | "warning";
  message: string;
  studentName?: string;
  point?: number;
  timeLabel?: string;
}

const SCAN_COOLDOWN_MS = 3000; // Tránh quét 2 lần liên tiếp

export default function ScanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>(""); // QR code vừa quét
  const lastTimeRef = useRef<number>(0); // Timestamp lần quét cuối
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [camError, setCamError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup khi unmount
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch (_) {}
    setScanning(false);
  };

  const startScanner = async () => {
    setCamError("");
    setResult(null);

    // ✅ iOS Fix: xin quyền camera trước khi khởi tạo scanner
    try {
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // camera sau
      });
    } catch (err) {
      setCamError(
        "Không thể truy cập camera. Vui lòng cho phép quyền camera trong cài đặt trình duyệt.",
      );
      return;
    }

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // camera sau mặc định
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanError,
      );
      setScanning(true);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
        setCamError(
          "Bị từ chối quyền camera. Vào Cài đặt → Trình duyệt → Camera → Cho phép.",
        );
      } else if (msg.includes("NotFoundError")) {
        setCamError("Không tìm thấy camera trên thiết bị này.");
      } else {
        setCamError(`Lỗi camera: ${msg}`);
      }
    }
  };

  // ✅ Debounce: bỏ qua nếu cùng QR hoặc chưa qua cooldown
  const onScanSuccess = async (qrCode: string) => {
    const now = Date.now();
    if (
      processing ||
      qrCode === lastScannedRef.current ||
      now - lastTimeRef.current < SCAN_COOLDOWN_MS
    )
      return;

    lastScannedRef.current = qrCode;
    lastTimeRef.current = now;
    setProcessing(true);

    try {
      const res = await api.post("/checkins/scan", { qr_code: qrCode });
      const data = res.data;
      setResult({
        type: "success",
        message: data.message,
        studentName: data.data?.student?.full_name,
        point: data.data?.point_earned,
        timeLabel: data.data?.time_label,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Lỗi không xác định";
      const status = err?.response?.status;
      setResult({
        type: status === 400 ? "warning" : "error",
        message: msg,
      });
    } finally {
      setProcessing(false);
      // Reset sau cooldown để có thể quét lại thiếu nhi khác
      setTimeout(() => {
        lastScannedRef.current = "";
      }, SCAN_COOLDOWN_MS);
    }
  };

  const onScanError = (_: string) => {
    // Bỏ qua lỗi "No QR code found" — đây là lỗi bình thường khi chưa quét được
  };

  const pointColor = (p?: number) =>
    p === 5 ? "text-emerald-400"
    : p === 2 ? "text-amber-400"
    : "text-red-400";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#080c14] text-white">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Header */}
          <h1 className="text-2xl font-black mb-1">📷 Điểm danh QR</h1>
          <p className="text-white/40 text-sm mb-6">
            {user?.full_name} · {user?.class_name ?? "Toàn đoàn"}
          </p>

          {/* Camera Error */}
          {camError && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              ❌ {camError}
              <p className="mt-2 text-red-300/70 text-xs">
                iPhone: Vào <b>Cài đặt → Safari/Chrome → Camera</b> → chọn{" "}
                <b>Cho phép</b>
              </p>
            </div>
          )}

          {/* Scanner box */}
          <div
            className="rounded-2xl overflow-hidden border border-white/10 mb-4 bg-black relative"
            style={{ minHeight: 300 }}
          >
            {/* html5-qrcode sẽ render vào div này */}
            <div id="qr-reader" className="w-full" />

            {/* Overlay khi chưa bật */}
            {!scanning && !camError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <p className="text-white/30 text-sm">Camera chưa bật</p>
              </div>
            )}

            {/* Processing overlay */}
            {processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Nút bật/tắt */}
          <button
            onClick={scanning ? stopScanner : startScanner}
            className={`w-full py-3 rounded-xl font-black text-sm mb-4 transition-all ${
              scanning ?
                "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
              : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {scanning ? "⏹ Dừng camera" : "▶ Bật camera quét QR"}
          </button>

          {/* Kết quả */}
          {result && (
            <div
              className={`rounded-2xl p-5 border transition-all ${
                result.type === "success" ?
                  "bg-emerald-500/10 border-emerald-500/30"
                : result.type === "warning" ?
                  "bg-amber-500/10 border-amber-500/30"
                : "bg-red-500/10 border-red-500/30"
              }`}
            >
              {result.type === "success" ?
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">✅</span>
                    <p className="font-black text-white text-lg">
                      {result.studentName}
                    </p>
                  </div>
                  <p
                    className={`text-3xl font-black ${pointColor(result.point)} mb-1`}
                  >
                    +{result.point} điểm
                  </p>
                  <p className="text-white/50 text-sm">{result.timeLabel}</p>
                </>
              : <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {result.type === "warning" ? "⚠️" : "❌"}
                  </span>
                  <p
                    className={`text-sm font-semibold ${
                      result.type === "warning" ?
                        "text-amber-400"
                      : "text-red-400"
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
              }
            </div>
          )}
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/30 transition-all mt-2"
          >
            Quay lại
          </button>

          {/* Ghi chú */}
          <p className="text-white/20 text-xs text-center mt-6">
            Mỗi QR chỉ được quét 1 lần · Cooldown {SCAN_COOLDOWN_MS / 1000}s
            giữa các lần quét
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
