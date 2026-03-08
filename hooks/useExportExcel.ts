"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import { api } from "@/lib/axios";

interface ClassExportData {
  meta: {
    class_name: string;
    nganh: string;
    total_students: number;
    total_sessions: number;
    exported_at: string;
  };
  students: StudentRow[];
  session_summary: SessionRow[];
}
interface AllExportData {
  meta: {
    scope: "all";
    total_students: number;
    total_sessions: number;
    total_classes: number;
    exported_at: string;
  };
  class_stats: ClassStat[];
  students: StudentRow[];
  session_summary: SessionRow[];
}
interface StudentRow {
  stt: number;
  id: string;
  full_name: string;
  saint_name: string;
  class_name?: string;
  nganh?: string;
  phone: string;
  is_active: boolean;
  total_checkins: number;
  total_points: number;
  on_time: number;
  late_2pts: number;
  late_0pts: number;
  attendance_rate: number;
}
interface ClassStat {
  stt: number;
  class_name: string;
  nganh: string;
  total_students: number;
  total_sessions: number;
  avg_rate: number;
  total_points: number;
}
interface SessionRow {
  date: string;
  total: number;
  on_time: number;
  late_2: number;
  late_0: number;
  absent: number;
}

// ── Helpers ────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function fmtNow(iso: string) {
  const d = new Date(iso);
  return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function rateColor(rate: number): string {
  if (rate >= 80) return "059669";
  if (rate >= 60) return "D97706";
  return "DC2626";
}

const THIN: ExcelJS.Border = { style: "thin", color: { argb: "FFD1D5DB" } };
const BD = { top: THIN, left: THIN, bottom: THIN, right: THIN };
const ALT = "F0F9FF";

function titleCell(c: ExcelJS.Cell, text: string, bg: string) {
  c.value = text;
  c.font = { name: "Arial", bold: true, size: 13, color: { argb: "FF1E3A5F" } };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bg } };
  c.alignment = { horizontal: "center", vertical: "middle" };
}
function hdrCell(c: ExcelJS.Cell, text: string, bg: string) {
  c.value = text;
  c.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bg } };
  c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  c.border = BD;
}
function dataCell(
  c: ExcelJS.Cell,
  value: ExcelJS.CellValue,
  opts: {
    bold?: boolean;
    color?: string;
    align?: ExcelJS.Alignment["horizontal"];
    bg?: string;
    fmt?: string;
  },
) {
  c.value = value;
  c.font = {
    name: "Arial",
    size: 10,
    bold: opts.bold ?? false,
    color: { argb: "FF" + (opts.color ?? "111827") },
  };
  c.alignment = { horizontal: opts.align ?? "left", vertical: "middle" };
  c.border = BD;
  if (opts.bg)
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF" + opts.bg },
    };
  if (opts.fmt) c.numFmt = opts.fmt;
}

// ── Sheet 1: Tổng quan ────────────────────────────────────
function addSheet1(
  wb: ExcelJS.Workbook,
  classStats: ClassStat[],
  exportedAt: string,
  totalStudents: number,
) {
  const ws = wb.addWorksheet("Tổng quan");
  ws.mergeCells("A1:F1");
  titleCell(
    ws.getCell("A1"),
    "BÁO CÁO ĐIỂM DANH XỨ ĐOÀN CHÚA BA NGÔI",
    "DBEAFE",
  );
  ws.getRow(1).height = 30;
  ws.mergeCells("A2:F2");
  const s = ws.getCell("A2");
  s.value = `Tháng ${new Date(exportedAt).getMonth() + 1} / ${new Date(exportedAt).getFullYear()}  —  Xuất lúc: ${fmtNow(exportedAt)}`;
  s.font = {
    name: "Arial",
    size: 9,
    italic: true,
    color: { argb: "FF6B7280" },
  };
  s.alignment = { horizontal: "center" };
  ws.getRow(2).height = 16;
  ws.getRow(3).height = 6;

  ["STT", "Tên lớp", "Ngành", "Sĩ số", "Tỷ lệ chuyên cần", "Tổng điểm"].forEach(
    (h, i) => {
      hdrCell(ws.getCell(4, i + 1), h, "1D4ED8");
      ws.getColumn(i + 1).width = [6, 20, 14, 8, 18, 12][i];
    },
  );
  ws.getRow(4).height = 22;

  classStats.forEach((r, i) => {
    const row = 5 + i;
    const bg = i % 2 === 0 ? ALT : undefined;
    dataCell(ws.getCell(row, 1), r.stt, { align: "center", bg });
    dataCell(ws.getCell(row, 2), r.class_name, { bold: true, bg });
    dataCell(ws.getCell(row, 3), r.nganh, { bg });
    dataCell(ws.getCell(row, 4), r.total_students, { align: "center", bg });
    dataCell(ws.getCell(row, 5), r.avg_rate / 100, {
      align: "center",
      bold: true,
      color: rateColor(r.avg_rate),
      bg,
      fmt: "0%",
    });
    dataCell(ws.getCell(row, 6), r.total_points, {
      align: "center",
      bold: true,
      color: "1D4ED8",
      bg,
    });
    ws.getRow(row).height = 18;
  });

  const tr = 5 + classStats.length;
  ws.mergeCells(`A${tr}:C${tr}`);
  const tc = ws.getCell(`A${tr}`);
  tc.value = "TỔNG CỘNG";
  tc.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
  tc.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E40AF" },
  };
  tc.alignment = { horizontal: "center", vertical: "middle" };
  tc.border = BD;
  [
    [4, totalStudents, undefined],
    [5, { formula: `=AVERAGE(E5:E${tr - 1})` }, "0%"],
    [6, { formula: `=SUM(F5:F${tr - 1})` }, undefined],
  ].forEach(([col, val, fmt]) => {
    const cc = ws.getCell(tr, col as number);
    cc.value = val as ExcelJS.CellValue;
    cc.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
    cc.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" },
    };
    cc.alignment = { horizontal: "center", vertical: "middle" };
    cc.border = BD;
    if (fmt) cc.numFmt = fmt as string;
  });
  ws.getRow(tr).height = 20;
  ws.views = [{ state: "frozen", ySplit: 4 }];
}

// ── Sheet 2: Danh sách thiếu nhi ─────────────────────────
function addSheet2(
  wb: ExcelJS.Workbook,
  students: StudentRow[],
  label: string,
  showClass: boolean,
) {
  const ws = wb.addWorksheet("Danh sách thiếu nhi");
  const totalCols = showClass ? 10 : 8;
  ws.mergeCells(`A1:${String.fromCharCode(64 + totalCols)}1`);
  titleCell(
    ws.getCell("A1"),
    `DANH SÁCH THIẾU NHI — ${label.toUpperCase()}`,
    "DBEAFE",
  );
  ws.getRow(1).height = 28;
  ws.getRow(2).height = 6;

  const hdrs =
    showClass ?
      [
        "#",
        "Họ và tên",
        "Tên Thánh",
        "Lớp",
        "Ngành",
        "ID",
        "Buổi ĐD",
        "Tổng điểm",
        "Chuyên cần",
        "Trạng thái",
      ]
    : [
        "#",
        "Họ và tên",
        "Tên Thánh",
        "ID",
        "Buổi ĐD",
        "Tổng điểm",
        "Chuyên cần",
        "Trạng thái",
      ];
  const widths =
    showClass ?
      [5, 22, 13, 14, 14, 12, 9, 11, 12, 12]
    : [5, 22, 13, 12, 9, 11, 12, 12];
  hdrs.forEach((h, i) => {
    hdrCell(ws.getCell(3, i + 1), h, "065F46");
    ws.getColumn(i + 1).width = widths[i];
  });
  ws.getRow(3).height = 22;

  students.forEach((s, i) => {
    const row = 4 + i;
    const bg = i % 2 === 0 ? ALT : undefined;
    let col = 1;
    dataCell(ws.getCell(row, col++), s.stt, { align: "center", bg });
    dataCell(ws.getCell(row, col++), s.full_name, { bold: true, bg });
    dataCell(ws.getCell(row, col++), s.saint_name, { bg });
    if (showClass) {
      dataCell(ws.getCell(row, col++), s.class_name ?? "", { bg });
      dataCell(ws.getCell(row, col++), s.nganh ?? "", { bg });
    }
    dataCell(ws.getCell(row, col++), s.id, {
      align: "center",
      color: "6B7280",
      bg,
    });
    dataCell(ws.getCell(row, col++), s.total_checkins, { align: "center", bg });
    dataCell(ws.getCell(row, col++), s.total_points, {
      align: "center",
      bold: true,
      color: "1D4ED8",
      bg,
    });
    dataCell(ws.getCell(row, col++), s.attendance_rate / 100, {
      align: "center",
      bold: true,
      color: rateColor(s.attendance_rate),
      bg,
      fmt: "0%",
    });
    dataCell(ws.getCell(row, col++), s.is_active ? "Hoạt động" : "Ngưng HĐ", {
      align: "center",
      bold: true,
      color: s.is_active ? "065F46" : "991B1B",
      bg: s.is_active ? "D1FAE5" : "FEE2E2",
    });
    ws.getRow(row).height = 18;
  });
  ws.views = [{ state: "frozen", ySplit: 3 }];
}

// ── Sheet 3: Lịch sử điểm danh ───────────────────────────
function addSheet3(
  wb: ExcelJS.Workbook,
  sessions: SessionRow[],
  totalStudents: number,
) {
  const ws = wb.addWorksheet("Tóm tắt buổi");
  ws.mergeCells("A1:G1");
  titleCell(ws.getCell("A1"), "TÓM TẮT ĐIỂM DANH THEO BUỔI", "FEF3C7");
  ws.getRow(1).height = 28;
  ws.getRow(2).height = 6;

  [
    "Ngày",
    "Có mặt",
    "Đúng giờ (5đ)",
    "Trễ nhẹ (2đ)",
    "Trễ (0đ)",
    "Vắng",
    "Tỷ lệ có mặt (%)",
  ].forEach((h, i) => {
    hdrCell(ws.getCell(3, i + 1), h, "B45309");
    ws.getColumn(i + 1).width = [13, 10, 15, 14, 11, 9, 16][i];
  });
  ws.getRow(3).height = 22;

  sessions.forEach((s, i) => {
    const row = 4 + i;
    const bg = i % 2 === 0 ? ALT : undefined;
    const pct =
      totalStudents > 0 ? Math.round((s.total / totalStudents) * 100) : 0;
    dataCell(ws.getCell(row, 1), fmtDate(String(s.date)), {
      align: "center",
      bold: true,
      bg,
    });
    dataCell(ws.getCell(row, 2), s.total, { align: "center", bg });
    dataCell(ws.getCell(row, 3), s.on_time, {
      align: "center",
      bold: true,
      color: "059669",
      bg,
    });
    dataCell(ws.getCell(row, 4), s.late_2, {
      align: "center",
      color: "D97706",
      bg,
    });
    dataCell(ws.getCell(row, 5), s.late_0, {
      align: "center",
      color: "DC2626",
      bg,
    });
    dataCell(ws.getCell(row, 6), s.absent, {
      align: "center",
      color: "6B7280",
      bg,
    });
    // Lưu số nguyên (ví dụ 4) thay vì số thập phân — tránh Excel hiển thị 0.038...
    ws.getCell(row, 7).value = pct;
    ws.getCell(row, 7).numFmt = '0"%"';
    ws.getCell(row, 7).font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FF" + rateColor(pct) },
    };
    ws.getCell(row, 7).alignment = { horizontal: "center", vertical: "middle" };
    ws.getCell(row, 7).border = BD;
    if (bg)
      ws.getCell(row, 7).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF" + bg },
      };
    ws.getRow(row).height = 18;
  });
  ws.views = [{ state: "frozen", ySplit: 3 }];
}

async function download(wb: ExcelJS.Workbook, fileName: string) {
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Hook ───────────────────────────────────────────────────
export function useExportExcel() {
  const [exporting, setExporting] = useState(false);

  // Export 1 lớp — dùng trong class detail page
  const exportClass = async (className: string) => {
    setExporting(true);
    try {
      const { data } = await api.get<ClassExportData>(
        `/leaderboard/classes/${encodeURIComponent(className)}/export`,
      );
      const wb = new ExcelJS.Workbook();
      wb.creator = "Xứ Đoàn Checkin";
      wb.created = new Date();
      const totalPoints = data.students.reduce(
        (s, st) => s + st.total_points,
        0,
      );
      const avgRate =
        data.meta.total_sessions > 0 && data.meta.total_students > 0 ?
          Math.round(
            (data.students.reduce((s, st) => s + st.total_checkins, 0) /
              (data.meta.total_sessions * data.meta.total_students)) *
              100,
          )
        : 0;
      addSheet1(
        wb,
        [
          {
            stt: 1,
            class_name: data.meta.class_name,
            nganh: data.meta.nganh,
            total_students: data.meta.total_students,
            total_sessions: data.meta.total_sessions,
            avg_rate: avgRate,
            total_points: totalPoints,
          },
        ],
        data.meta.exported_at,
        data.meta.total_students,
      );
      addSheet2(wb, data.students, data.meta.class_name, false);
      addSheet3(wb, data.session_summary, data.meta.total_students);
      await download(
        wb,
        `DiemDanh_${className.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("en-CA")}.xlsx`,
      );
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Export thất bại!");
    } finally {
      setExporting(false);
    }
  };

  // Export toàn đoàn — dùng trong dashboard / statistics page
  const exportAll = async () => {
    setExporting(true);
    try {
      const { data } = await api.get<AllExportData>("/statistics/export");
      const wb = new ExcelJS.Workbook();
      wb.creator = "Xứ Đoàn Checkin";
      wb.created = new Date();
      addSheet1(
        wb,
        data.class_stats,
        data.meta.exported_at,
        data.meta.total_students,
      );
      addSheet2(wb, data.students, "TOÀN ĐOÀN", true); // có thêm cột Lớp + Ngành
      addSheet3(wb, data.session_summary, data.meta.total_students);
      await download(
        wb,
        `DiemDanh_ToanDoan_${new Date().toLocaleDateString("en-CA")}.xlsx`,
      );
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.error || "Export toàn đoàn thất bại!",
      );
    } finally {
      setExporting(false);
    }
  };

  return { exportClass, exportAll, exporting };
}
