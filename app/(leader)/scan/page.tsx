"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { api } from "@/lib/axios";
import { ProtectedRoute } from "@/components/ProtectedRoute/page";
import { useRouter } from "next/navigation";

type ScanStatus = "idle" | "scanning" | "success" | "error";

interface ScanResult {
  student_name?: string;
  class_name?: string;
  message?: string;
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    try {
      BrowserMultiFormatReader.releaseAllStreams();
    } catch {}
    readerRef.current = null;
    setIsStarted(false);
  };

  const startScan = async () => {
    if (!videoRef.current) return;

    setIsStarted(true);
    setStatus("scanning");
    setResult(null);
    setErrorMsg("");

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (qrResult, err) => {
          if (err) {
            if (err instanceof NotFoundException) return;
            console.warn("QR scan error:", err);
            return;
          }

          if (!qrResult) return;

          const qrCode = qrResult.getText();
          stopCamera();

          try {
            // ✅ FIX: đúng endpoint /checkins/scan
            const res = await api.post("/checkins/scan", { qr_code: qrCode });
            const data = res.data?.data;

            setResult({
              student_name: data?.student?.full_name,
              class_name: data?.student?.class_name,
              message: res.data?.message || "Điểm danh thành công!",
            });
            setStatus("success");
          } catch (apiErr: any) {
            const msg =
              apiErr?.response?.data?.message ||
              apiErr?.response?.data?.error ||
              "Điểm danh thất bại!";
            setErrorMsg(msg);
            setStatus("error");
          }
        },
      );
    } catch {
      setErrorMsg("Không thể mở camera. Vui lòng kiểm tra quyền truy cập!");
      setStatus("error");
      setIsStarted(false);
    }
  };

  const reset = () => {
    stopCamera();
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
  };

  return (
    <ProtectedRoute permissions={["checkins:write"]}>
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">📷 Quét QR</h1>
            <p className="text-white/40 text-sm mt-1">Điểm danh thiếu nhi</p>
          </div>

          {/* Camera */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-square mb-6">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: isStarted ? "block" : "none" }}
              playsInline
              muted
            />

            {!isStarted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl mb-3">📷</p>
                  <p className="text-white/30 text-sm">Camera chưa bật</p>
                </div>
              </div>
            )}

            {/* Khung ngắm */}
            {isStarted && status === "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                  <div className="absolute left-2 right-2 h-0.5 bg-amber-400/70 animate-scan-line" />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          {status === "success" && result && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 mb-4 text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-emerald-400 font-black text-lg">
                {result.message}
              </p>
              {result.student_name && (
                <p className="text-white font-semibold mt-1">
                  {result.student_name}
                </p>
              )}
              {result.class_name && (
                <p className="text-white/50 text-sm">Lớp {result.class_name}</p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5 mb-4 text-center">
              <p className="text-4xl mb-2">❌</p>
              <p className="text-red-400 font-semibold">{errorMsg}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {!isStarted ?
              <button
                onClick={startScan}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 text-black font-black text-lg shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all"
              >
                Bắt đầu quét
              </button>
            : <button
                onClick={reset}
                className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
              >
                Dừng camera
              </button>
            }

            {(status === "success" || status === "error") && (
              <button
                onClick={startScan}
                className="w-full py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/30 transition-all"
              >
                Quét tiếp
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="w-full py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/30 transition-all"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
