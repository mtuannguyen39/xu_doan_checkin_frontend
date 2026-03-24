"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { AcademicScore, StudentHocBa } from "./shared/types";
import { Card } from "./shared/Card";
import { Field } from "./shared/Fields";
import {
  SCORE_TYPES,
  inputCls,
  labelCls,
  btnPrimaryCls,
  btnSecondaryCls,
} from "./shared/styles";

interface TabScoresProps {
  student: StudentHocBa;
  selectedYearId: number | null;
  canEdit: boolean;
  onRefresh: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

function scoreColor(v: number | null) {
  if (v === null) return "text-white/25";
  if (v >= 8) return "text-emerald-400";
  if (v >= 5) return "text-amber-400";
  return "text-red-400";
}

// Inline edit — dùng modal bottom-sheet style trên mobile
function EditSheet({
  score,
  onSave,
  onCancel,
  saving,
}: {
  score: AcademicScore;
  onSave: (value: string, note: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(score.value?.toString() ?? "");
  const [note, setNote] = useState(score.note ?? "");

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Sheet */}
      <div
        className="w-full sm:max-w-sm bg-[#111318] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-white">Chỉnh sửa điểm</p>
            <p className="text-xs text-white/40 mt-0.5">{score.label}</p>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full bg-white/8 text-white/50 text-sm flex items-center justify-center touch-manipulation"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className={labelCls}>Điểm số</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type="number"
              min="0"
              max="10"
              step="0.1"
              inputMode="decimal"
              className={inputCls}
              placeholder="0 – 10"
              autoFocus
            />
          </div>
          <div>
            <label className={labelCls}>Ghi chú</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputCls}
              placeholder="Không bắt buộc"
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onCancel}
            className={`${btnSecondaryCls} flex-1 touch-manipulation`}
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(value, note)}
            disabled={saving}
            className={`${btnPrimaryCls} flex-1 touch-manipulation`}
          >
            {saving ? "Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TabScores({
  student,
  selectedYearId,
  canEdit,
  onRefresh,
  showToast,
}: TabScoresProps) {
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<string>(SCORE_TYPES[0].type);
  const [newLabel, setNewLabel] = useState<string>(SCORE_TYPES[0].label);
  const [newValue, setNewValue] = useState("");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingScore, setEditingScore] = useState<AcademicScore | null>(null);

  const grouped = SCORE_TYPES.map((st) => ({
    ...st,
    scores: student.scores.filter((s) => s.score_type === st.type),
  }));

  const handleAdd = async () => {
    if (!selectedYearId || !newLabel) return;
    setSaving(true);
    try {
      await api.post(`/hoc-ba/students/${student.id}/scores`, {
        school_year_id: selectedYearId,
        score_type: newType,
        label: newLabel,
        value: newValue !== "" ? Number(newValue) : null,
        note: newNote || null,
      });
      showToast("Đã lưu điểm!", "success");
      setAdding(false);
      setNewValue("");
      setNewNote("");
      onRefresh();
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? "Lưu điểm thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (value: string, note: string) => {
    if (!editingScore) return;
    setSaving(true);
    try {
      await api.post(`/hoc-ba/students/${student.id}/scores`, {
        school_year_id: editingScore.school_year_id,
        score_type: editingScore.score_type,
        label: editingScore.label,
        value: value !== "" ? Number(value) : null,
        note: note || null,
      });
      showToast("Đã cập nhật điểm!", "success");
      setEditingScore(null);
      onRefresh();
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? "Cập nhật thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scoreId: number) => {
    try {
      await api.delete(`/hoc-ba/students/${student.id}/scores/${scoreId}`);
      showToast("Đã xóa điểm!", "success");
      onRefresh();
    } catch {
      showToast("Xóa điểm thất bại!", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Edit bottom sheet */}
      {editingScore && (
        <EditSheet
          score={editingScore}
          onSave={handleEditSave}
          onCancel={() => setEditingScore(null)}
          saving={saving}
        />
      )}

      {/* Toolbar */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => setAdding(!adding)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all touch-manipulation ${
              adding ?
                "bg-white/5 border border-white/10 text-white/50"
              : "bg-blue-500/15 border border-blue-500/35 text-blue-400 active:bg-blue-500/25"
            }`}
          >
            {adding ? "✕ Hủy" : "+ Thêm điểm"}
          </button>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <Card title="Thêm điểm mới" icon="✏️">
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>Loại điểm</label>
                <select
                  value={newType}
                  onChange={(e) => {
                    const found = SCORE_TYPES.find(
                      (s) => s.type === e.target.value,
                    );
                    setNewType(e.target.value);
                    if (found) setNewLabel(found.label);
                  }}
                  className={inputCls}
                >
                  {SCORE_TYPES.map((s) => (
                    <option key={s.type} value={s.type}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Tên hiển thị"
                value={newLabel}
                onChange={setNewLabel}
                placeholder="VD: Kiểm tra 15p lần 1"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field
                label="Điểm số (để trống nếu chưa có)"
                value={newValue}
                onChange={setNewValue}
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="0 – 10"
              />
              <Field
                label="Ghi chú"
                value={newNote}
                onChange={setNewNote}
                placeholder="Không bắt buộc"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 mt-4">
            <button
              onClick={() => setAdding(false)}
              className={`${btnSecondaryCls} touch-manipulation`}
            >
              Hủy
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !newLabel}
              className={`${btnPrimaryCls} touch-manipulation`}
            >
              {saving ? "Đang lưu..." : "💾 Lưu điểm"}
            </button>
          </div>
        </Card>
      )}

      {/* Score groups */}
      {grouped.map(({ type, label, accent, scores }) => (
        <Card
          key={type}
          title={label}
          icon="📝"
          accent={accent}
          action={
            <span className="text-[11px] text-white/25 font-medium">
              {scores.length} mục
            </span>
          }
        >
          {scores.length === 0 ?
            <p className="text-sm text-white/20">Chưa có điểm nào</p>
          : <div className="flex flex-col gap-2">
              {scores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/6"
                >
                  {/* Label + note */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/75 truncate">{s.label}</p>
                    {s.note && (
                      <p className="text-[11px] text-white/25 italic truncate mt-0.5">
                        {s.note}
                      </p>
                    )}
                  </div>

                  {/* Score value */}
                  <span
                    className={`text-xl font-black shrink-0 tabular-nums ${scoreColor(s.value)}`}
                  >
                    {s.value !== null ? s.value : "—"}
                  </span>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditingScore(s)}
                        className="w-8 h-8 rounded-xl bg-blue-500/10 active:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs transition-colors touch-manipulation"
                        title="Chỉnh sửa"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 active:bg-red-500/20 border border-red-500/20 text-red-400 text-xs transition-colors touch-manipulation"
                        title="Xóa"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </Card>
      ))}

      {/* Empty state */}
      {student.scores.length === 0 && !adding && (
        <div className="text-center py-12 text-white/20">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">Chưa có điểm nào trong năm học này</p>
          {canEdit && (
            <p className="text-xs mt-1">Bấm "+ Thêm điểm" để bắt đầu</p>
          )}
        </div>
      )}
    </div>
  );
}
