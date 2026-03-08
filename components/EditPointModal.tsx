"use client";

import { api } from "@/lib/axios";
import { useState } from "react";

interface CheckinRecord {
  checkin_id: number; // Id của bản ghi checkin (không phải student ID)
  date: string; // checkin_date ISO string
  point: number; // current point: 0 | 2 | 5
  student_name: string;
}

const POINT_OPTIONS = [
  { value: 5, label: "Đúng giờ", desc: "6:45 - 7:15", color: "emerald" },
  { value: 2, label: "Trễ nhẹ", desc: "7:16 - 7:20", color: "amber" },
  { value: 0, label: "Trễ", desc: "Sau 7:20", color: "red" },
] as const;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function EditPointModal({
  checkin,
  onSaved,
  onCancel,
}: {
  checkin: CheckinRecord;
  onSaved: (checkinId: number, newPoint: number) => void;
  onCancel: () => void;
}) {
  const [selectedPoint, setSelectedPoint] = useState<number>(checkin.point);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDirty = selectedPoint !== checkin.point;

  const handleSave = async () => {
    if (!isDirty) {
      onCancel();
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch(`/checkins/${checkin.checkin_id}/point`, {
        point: selectedPoint,
        reason: reason.trim() || undefined,
      });
      onSaved(checkin.checkin_id, selectedPoint);
    } catch (error: any) {
      setError(error?.response?.data?.error || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/15 p-6"
        style={{ background: "rgba(10,14,25,0.99)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h3 className="text-white font-black text-lg mb-1">Chỉnh sửa điểm</h3>
        <p className="text-white/40 text-xs mb-5">
          {checkin.student_name} - {fmtDate(checkin.date)}
        </p>

        {/* Điểm hiện tại */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <span className="text-white/40 text-xs">Điểm hiện tại:</span>
          <span
            className={`font-bold text-sm ${
              checkin.point === 5 ? "text-emerald-400"
              : checkin.point === 2 ? "text-amber-400"
              : "text-red-400"
            }`}
          >
            {checkin.point} điểm (
            {checkin.point === 5 ?
              "Đúng giờ"
            : checkin.point === 2 ?
              "Trễ nhẹ"
            : "Trễ"}
            )
          </span>
        </div>

        {/* Chọn điểm mới */}
        <p className="text-white/50 text-xs font-semibold mb-2">Điểm mới:</p>
        <div className="flex flex-col gap-2 mb-4">
          {POINT_OPTIONS.map((opt) => {
            const selected = selectedPoint === opt.value;
            const colorMap: Record<string, string> = {
              emerald:
                selected ?
                  "bg-emerald-500/20 border-emerald-500/60"
                : "bg-white/5 border-white/10 hover:border-emerald-500/30",
              amber:
                selected ?
                  "bg-amber-500/20 border-amber-500/60"
                : "bg-white/5 border-white/10 hover:border-amber-500/30",
              red:
                selected ?
                  "bg-red-500/20 border-red-500/60"
                : "bg-white/5 border-white/10 hover:border-red-500/30",
            };
            const textMap: Record<string, string> = {
              emerald: "text-emerald-400",
              amber: "text-amber-400",
              red: "text-red-400",
            };
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedPoint(opt.value)}
                className={`flex itemd-center justify-between px-4 py-3 rounded-xl border transition-all ${colorMap[opt.color]}`}
              >
                <div className="text-left">
                  <p
                    className={`font-bold text-sm ${selected ? textMap[opt.color] : "text-white"}`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-white/30 text-xs">{opt.desc}</p>
                </div>
                <span className={`text-xl font-black ${textMap[opt.color]}`}>
                  {opt.value} điểm
                </span>
              </button>
            );
          })}
        </div>

        {/* Lý do sửa điểm (không bắt buộc) */}
        <div className="mb-5">
          <label className="text-white/50 text-xs font-semibold mb-1.5 block">
            Lý do chỉnh sửa{" "}
            <span className="text-white/20">(Không bắt buộc)</span>
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Thiếu nhi đến sớm nhưng trưởng đến trễ"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        {error && <p className="text-red-400 text-xs mb-3">❌ {error}</p>}

        {/* Button */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            className="flex-1 py-2.5 rounded-x; bg-blue-500 text-white font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {loading ?
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </span>
            : isDirty ?
              "Lưu thay đổi"
            : "Không có thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
