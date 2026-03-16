/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// ============================================================
// Hook: useExportExcel — dùng "exceljs" (có màu đầy đủ)
//
// ⚠️  xlsx (SheetJS free) KHÔNG hỗ trợ cell styling/color
//     → phải dùng exceljs thay thế
//
// Cài đặt:
//   npm install exceljs
//   npm uninstall xlsx    ← bỏ cái cũ nếu có
// ============================================================

import { useState } from "react";
import ExcelJS from "exceljs";
import { api } from "@/lib/axios";

interface ClassExportData {
  meta: { class_name: string; nganh: string; total_students: number; total_sessions: number; exported_at: string };
  students: StudentRow[];
  session_summary: SessionRow[];
}
interface AllExportData {
  meta: { scope: "all"; total_students: number; total_sessions: number; total_classes: number; exported_at: string };
  class_stats: ClassStat[];
  students: StudentRow[];
  session_summary: SessionRow[];
}
interface StudentRow {
  stt: number; id: string; full_name: string; saint_name: string;
  class_name?: string; nganh?: string; phone: string; is_active: boolean;
  total_checkins: number; total_points: number;
  on_time: number; late_2pts: number; late_0pts: number; attendance_rate: number;
}
interface ClassStat {
  stt: number; class_name: string; nganh: string;
  total_students: number; total_sessions: number; avg_rate: number; total_points: number;
}
interface SessionRow {
  date: string; total: number; on_time: number; late_2: number; late_0: number; absent: number;
}

interface DayRow {
  stt: number; id: string; full_name: string; saint_name: string;
  phone: string; is_active: boolean;
  status: "present" | "absent";
  point: number | null;
  point_label: string;
  checkin_time: string | null;
  checked_by: string;
}

interface DayExportData {
  meta: {
    class_name: string; nganh: string;
    date: string; date_label: string;
    total_students: number; present: number; absent: number;
    on_time: number; late_2: number; late_0: number;
    attendance_rate: number; exported_at: string;
  };
  rows: DayRow[];
}

interface AllDayExportData {
  meta: {
    scope: "all"; date: string; date_label: string;
    total_students: number; total_classes: number;
    present: number; absent: number;
    on_time: number; late_2: number; late_0: number;
    attendance_rate: number; exported_at: string;
  };
  rows: (DayRow & { class_name: string; nganh: string })[];
  class_summary: {
    class_name: string; total_students: number;
    present: number; absent: number;
    on_time: number; late_2: number; late_0: number;
    attendance_rate: number;
  }[];
}

// ── Helpers ────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}
function fmtNow(iso: string) {
  const d = new Date(iso);
  return `${fmtDate(iso)} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
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
  c.font  = { name: "Arial", bold: true, size: 13, color: { argb: "FF1E3A5F" } };
  c.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bg } };
  c.alignment = { horizontal: "center", vertical: "middle" };
}
function hdrCell(c: ExcelJS.Cell, text: string, bg: string) {
  c.value = text;
  c.font  = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
  c.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bg } };
  c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  c.border = BD;
}
function dataCell(c: ExcelJS.Cell, value: ExcelJS.CellValue, opts: {
  bold?: boolean; color?: string; align?: ExcelJS.Alignment["horizontal"]; bg?: string; fmt?: string;
}) {
  c.value = value;
  c.font  = { name: "Arial", size: 10, bold: opts.bold ?? false, color: { argb: "FF" + (opts.color ?? "111827") } };
  c.alignment = { horizontal: opts.align ?? "left", vertical: "middle" };
  c.border = BD;
  if (opts.bg) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + opts.bg } };
  if (opts.fmt) c.numFmt = opts.fmt;
}

// ── Sheet 1: Tổng quan ────────────────────────────────────
function addSheet1(wb: ExcelJS.Workbook, classStats: ClassStat[], exportedAt: string, totalStudents: number) {
  const ws = wb.addWorksheet("Tổng quan");
  ws.mergeCells("A1:F1"); titleCell(ws.getCell("A1"), "BÁO CÁO ĐIỂM DANH XỨ ĐOÀN CHÚA BA NGÔI", "DBEAFE");
  ws.getRow(1).height = 30;
  ws.mergeCells("A2:F2");
  const s = ws.getCell("A2");
  s.value = `Tháng ${new Date(exportedAt).getMonth()+1} / ${new Date(exportedAt).getFullYear()}  —  Xuất lúc: ${fmtNow(exportedAt)}`;
  s.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF6B7280" } };
  s.alignment = { horizontal: "center" };
  ws.getRow(2).height = 16; ws.getRow(3).height = 6;

  ["STT","Tên lớp","Ngành","Sĩ số","Tỷ lệ chuyên cần","Tổng điểm"].forEach((h, i) => {
    hdrCell(ws.getCell(4, i+1), h, "1D4ED8");
    ws.getColumn(i+1).width = [6,20,14,8,18,12][i];
  });
  ws.getRow(4).height = 22;

  classStats.forEach((r, i) => {
    const row = 5+i; const bg = i%2===0 ? ALT : undefined;
    dataCell(ws.getCell(row,1), r.stt,           { align:"center", bg });
    dataCell(ws.getCell(row,2), r.class_name,    { bold:true, bg });
    dataCell(ws.getCell(row,3), r.nganh,         { bg });
    dataCell(ws.getCell(row,4), r.total_students,{ align:"center", bg });
    dataCell(ws.getCell(row,5), r.avg_rate/100,  { align:"center", bold:true, color:rateColor(r.avg_rate), bg, fmt:"0%" });
    dataCell(ws.getCell(row,6), r.total_points,  { align:"center", bold:true, color:"1D4ED8", bg });
    ws.getRow(row).height = 18;
  });

  const tr = 5 + classStats.length;
  ws.mergeCells(`A${tr}:C${tr}`);
  const tc = ws.getCell(`A${tr}`);
  tc.value = "TỔNG CỘNG"; tc.font = { name:"Arial", bold:true, color:{argb:"FFFFFFFF"} };
  tc.fill = { type:"pattern", pattern:"solid", fgColor:{argb:"FF1E40AF"} };
  tc.alignment = { horizontal:"center", vertical:"middle" }; tc.border = BD;
  [[4, totalStudents, undefined],[5, {formula:`=AVERAGE(E5:E${tr-1})`},"0%"],[6,{formula:`=SUM(F5:F${tr-1})`},undefined]].forEach(([col,val,fmt])=>{
    const cc = ws.getCell(tr, col as number); cc.value = val as ExcelJS.CellValue;
    cc.font = {name:"Arial",bold:true,color:{argb:"FFFFFFFF"}};
    cc.fill = {type:"pattern",pattern:"solid",fgColor:{argb:"FF1E40AF"}};
    cc.alignment = {horizontal:"center",vertical:"middle"}; cc.border = BD;
    if (fmt) cc.numFmt = fmt as string;
  });
  ws.getRow(tr).height = 20;
  ws.views = [{ state:"frozen", ySplit:4 }];
}

// ── Sheet 2: Danh sách thiếu nhi ─────────────────────────
function addSheet2(wb: ExcelJS.Workbook, students: StudentRow[], label: string, showClass: boolean) {
  const ws = wb.addWorksheet("Danh sách thiếu nhi");
  const totalCols = showClass ? 10 : 8;
  ws.mergeCells(`A1:${String.fromCharCode(64+totalCols)}1`);
  titleCell(ws.getCell("A1"), `DANH SÁCH THIẾU NHI — ${label.toUpperCase()}`, "DBEAFE");
  ws.getRow(1).height = 28; ws.getRow(2).height = 6;

  const hdrs = showClass
    ? ["#","Họ và tên","Tên Thánh","Lớp","Ngành","ID","Buổi ĐD","Tổng điểm","Chuyên cần","Trạng thái"]
    : ["#","Họ và tên","Tên Thánh","ID","Buổi ĐD","Tổng điểm","Chuyên cần","Trạng thái"];
  const widths = showClass ? [5,22,13,14,14,12,9,11,12,12] : [5,22,13,12,9,11,12,12];
  hdrs.forEach((h,i) => { hdrCell(ws.getCell(3,i+1), h, "065F46"); ws.getColumn(i+1).width = widths[i]; });
  ws.getRow(3).height = 22;

  students.forEach((s, i) => {
    const row = 4+i; const bg = i%2===0 ? ALT : undefined; let col = 1;
    dataCell(ws.getCell(row, col++), s.stt,            { align:"center", bg });
    dataCell(ws.getCell(row, col++), s.full_name,      { bold:true, bg });
    dataCell(ws.getCell(row, col++), s.saint_name,     { bg });
    if (showClass) {
      dataCell(ws.getCell(row, col++), s.class_name ?? "", { bg });
      dataCell(ws.getCell(row, col++), s.nganh ?? "",       { bg });
    }
    dataCell(ws.getCell(row, col++), s.id,              { align:"center", color:"6B7280", bg });
    dataCell(ws.getCell(row, col++), s.total_checkins,  { align:"center", bg });
    dataCell(ws.getCell(row, col++), s.total_points,    { align:"center", bold:true, color:"1D4ED8", bg });
    dataCell(ws.getCell(row, col++), s.attendance_rate/100, { align:"center", bold:true, color:rateColor(s.attendance_rate), bg, fmt:"0%" });
    dataCell(ws.getCell(row, col++), s.is_active ? "Hoạt động" : "Ngưng HĐ", {
      align:"center", bold:true, color: s.is_active ? "065F46" : "991B1B", bg: s.is_active ? "D1FAE5" : "FEE2E2",
    });
    ws.getRow(row).height = 18;
  });
  ws.views = [{ state:"frozen", ySplit:3 }];
}

// ── Sheet 3: Lịch sử điểm danh ───────────────────────────
function addSheet3(wb: ExcelJS.Workbook, sessions: SessionRow[], totalStudents: number) {
  const ws = wb.addWorksheet("Tóm tắt buổi");
  ws.mergeCells("A1:G1"); titleCell(ws.getCell("A1"), "TÓM TẮT ĐIỂM DANH THEO BUỔI", "FEF3C7");
  ws.getRow(1).height = 28; ws.getRow(2).height = 6;

  ["Ngày","Có mặt","Đúng giờ (5đ)","Trễ nhẹ (2đ)","Trễ (0đ)","Vắng","Tỷ lệ có mặt (%)"].forEach((h,i) => {
    hdrCell(ws.getCell(3,i+1), h, "B45309");
    ws.getColumn(i+1).width = [13,10,15,14,11,9,16][i];
  });
  ws.getRow(3).height = 22;

  sessions.forEach((s,i) => {
    const row  = 4+i;
    const bg   = i%2===0 ? ALT : undefined;
    const pct  = totalStudents > 0 ? Math.round((s.total/totalStudents)*100) : 0;
    dataCell(ws.getCell(row,1), fmtDate(String(s.date)), { align:"center", bold:true, bg });
    dataCell(ws.getCell(row,2), s.total,   { align:"center", bg });
    dataCell(ws.getCell(row,3), s.on_time, { align:"center", bold:true, color:"059669", bg });
    dataCell(ws.getCell(row,4), s.late_2,  { align:"center", color:"D97706", bg });
    dataCell(ws.getCell(row,5), s.late_0,  { align:"center", color:"DC2626", bg });
    dataCell(ws.getCell(row,6), s.absent,  { align:"center", color:"6B7280", bg });
    // Lưu số nguyên (ví dụ 4) thay vì số thập phân — tránh Excel hiển thị 0.038...
    ws.getCell(row,7).value = pct;
    ws.getCell(row,7).numFmt = '0"%"';
    ws.getCell(row,7).font = { name:"Arial", size:10, bold:true, color:{argb:"FF"+rateColor(pct)} };
    ws.getCell(row,7).alignment = { horizontal:"center", vertical:"middle" };
    ws.getCell(row,7).border = BD;
    if (bg) ws.getCell(row,7).fill = { type:"pattern", pattern:"solid", fgColor:{argb:"FF"+bg} };
    ws.getRow(row).height = 18;
  });
  ws.views = [{ state:"frozen", ySplit:3 }];
}


// ── Sheet 4: Chi tiết 1 ngày ──────────────────────────────
function addSheet4(wb: ExcelJS.Workbook, data: DayExportData) {
  const ws = wb.addWorksheet("Chi tiết ngày");
  const { meta, rows } = data;

  // Title
  ws.mergeCells("A1:H1");
  titleCell(ws.getCell("A1"), `CHI TIẾT ĐIỂM DANH — ${meta.date_label.toUpperCase()}`, "FEF3C7");
  ws.getRow(1).height = 28;

  // Summary row
  ws.mergeCells("A2:H2");
  const s2 = ws.getCell("A2");
  s2.value = `Lớp: ${meta.class_name}  |  Có mặt: ${meta.present}/${meta.total_students}  |  Đúng giờ: ${meta.on_time}  |  Trễ nhẹ: ${meta.late_2}  |  Trễ: ${meta.late_0}  |  Vắng: ${meta.absent}  |  Tỷ lệ: ${meta.attendance_rate}%`;
  s2.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF6B7280" } };
  s2.alignment = { horizontal: "center" };
  ws.getRow(2).height = 16;
  ws.getRow(3).height = 6;

  // Headers
  const hdrs = ["#", "Họ và tên", "Tên Thánh", "Trạng thái", "Điểm", "Giờ điểm danh", "Người điểm danh", "SĐT"];
  const widths = [5, 22, 13, 13, 11, 16, 18, 13];
  hdrs.forEach((h, i) => {
    hdrCell(ws.getCell(4, i+1), h, "B45309");
    ws.getColumn(i+1).width = widths[i];
  });
  ws.getRow(4).height = 22;

  rows.forEach((r, i) => {
    const row = 5 + i;
    const bg  = i % 2 === 0 ? ALT : undefined;
    const isPresent = r.status === "present";

    dataCell(ws.getCell(row, 1), r.stt,        { align: "center", bg });
    dataCell(ws.getCell(row, 2), r.full_name,  { bold: true, bg });
    dataCell(ws.getCell(row, 3), r.saint_name, { bg });

    // Trạng thái — màu theo present/absent
    dataCell(ws.getCell(row, 4), isPresent ? "Có mặt" : "Vắng", {
      align: "center", bold: true,
      color: isPresent ? "065F46" : "991B1B",
      bg:    isPresent ? "D1FAE5" : "FEE2E2",
    });

    // Điểm
    if (isPresent) {
      dataCell(ws.getCell(row, 5), r.point_label, {
        align: "center", bold: true,
        color: r.point === 5 ? "059669" : r.point === 2 ? "D97706" : "DC2626",
        bg,
      });
    } else {
      dataCell(ws.getCell(row, 5), "—", { align: "center", color: "9CA3AF", bg });
    }

    // Giờ điểm danh
    const timeStr = r.checkin_time
      ? new Date(r.checkin_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" })
      : "—";
    dataCell(ws.getCell(row, 6), timeStr, { align: "center", color: isPresent ? "111827" : "9CA3AF", bg });

    dataCell(ws.getCell(row, 7), r.checked_by || "—", { color: "6B7280", bg });
    dataCell(ws.getCell(row, 8), r.phone || "—",      { color: "6B7280", bg });

    ws.getRow(row).height = 18;
  });

  // Totals footer
  const tr = 5 + rows.length;
  ws.mergeCells(`A${tr}:C${tr}`);
  const tc = ws.getCell(`A${tr}`);
  tc.value = "TỔNG KẾT";
  tc.font  = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
  tc.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB45309" } };
  tc.alignment = { horizontal: "center", vertical: "middle" };
  tc.border = BD;

  const footerCells: [number, string | number, string?][] = [
    [4, `${meta.present} có mặt / ${meta.absent} vắng`],
    [5, `${meta.on_time} đúng giờ · ${meta.late_2} trễ nhẹ · ${meta.late_0} trễ`],
    [6, `${meta.attendance_rate}%`],
  ];
  footerCells.forEach(([col, val]) => {
    const cc = ws.getCell(tr, col as number);
    cc.value = val;
    cc.font  = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
    cc.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB45309" } };
    cc.alignment = { horizontal: "center", vertical: "middle" };
    cc.border = BD;
  });
  // Fill remaining footer cells
  [7, 8].forEach((col) => {
    const cc = ws.getCell(tr, col);
    cc.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB45309" } };
    cc.border = BD;
  });
  ws.getRow(tr).height = 20;
  ws.views = [{ state: "frozen", ySplit: 4 }];
}


// ── Sheet 4: Chi tiết 1 ngày — TOÀN ĐOÀN ─────────────────
function addSheet4All(wb: ExcelJS.Workbook, data: AllDayExportData) {
  const ws = wb.addWorksheet("Chi tiết ngày - Toàn đoàn");
  const { meta, rows, class_summary } = data;

  // Title
  ws.mergeCells("A1:I1");
  titleCell(ws.getCell("A1"), `CHI TIẾT ĐIỂM DANH TOÀN ĐOÀN — ${meta.date_label.toUpperCase()}`, "FEF3C7");
  ws.getRow(1).height = 28;

  // Summary
  ws.mergeCells("A2:I2");
  const s2 = ws.getCell("A2");
  s2.value = `Toàn đoàn: ${meta.present}/${meta.total_students} có mặt  |  Đúng giờ: ${meta.on_time}  |  Trễ nhẹ: ${meta.late_2}  |  Trễ: ${meta.late_0}  |  Vắng: ${meta.absent}  |  Tỷ lệ: ${meta.attendance_rate}%`;
  s2.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF6B7280" } };
  s2.alignment = { horizontal: "center" };
  ws.getRow(2).height = 16;
  ws.getRow(3).height = 6;

  // Headers — có thêm cột Lớp
  const hdrs = ["#", "Họ và tên", "Tên Thánh", "Lớp", "Trạng thái", "Điểm", "Giờ ĐD", "Người ĐD", "SĐT"];
  const widths = [5, 22, 13, 14, 13, 11, 14, 18, 13];
  hdrs.forEach((h, i) => {
    hdrCell(ws.getCell(4, i+1), h, "B45309");
    ws.getColumn(i+1).width = widths[i];
  });
  ws.getRow(4).height = 22;

  let currentClass = "";
  let rowNum = 5;

  rows.forEach((r, i) => {
    // In header lớp mỗi khi đổi lớp
    if (r.class_name !== currentClass) {
      currentClass = r.class_name;
      const cs = class_summary.find((c) => c.class_name === currentClass);
      ws.mergeCells(`A${rowNum}:I${rowNum}`);
      const classCell = ws.getCell(`A${rowNum}`);
      classCell.value = `${currentClass}  —  ${cs?.present ?? 0}/${cs?.total_students ?? 0} có mặt  (${cs?.attendance_rate ?? 0}%)`;
      classCell.font  = { name: "Arial", bold: true, size: 10, color: { argb: "FF1E3A5F" } };
      classCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0F2FE" } };
      classCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      classCell.border = BD;
      ws.getRow(rowNum).height = 18;
      rowNum++;
    }

    const bg        = i % 2 === 0 ? ALT : undefined;
    const isPresent = r.status === "present";

    dataCell(ws.getCell(rowNum, 1), r.stt,        { align: "center", bg });
    dataCell(ws.getCell(rowNum, 2), r.full_name,  { bold: true, bg });
    dataCell(ws.getCell(rowNum, 3), r.saint_name, { bg });
    dataCell(ws.getCell(rowNum, 4), r.class_name, { color: "6B7280", bg });
    dataCell(ws.getCell(rowNum, 5), isPresent ? "Có mặt" : "Vắng", {
      align: "center", bold: true,
      color: isPresent ? "065F46" : "991B1B",
      bg:    isPresent ? "D1FAE5" : "FEE2E2",
    });
    if (isPresent) {
      dataCell(ws.getCell(rowNum, 6), r.point_label, {
        align: "center", bold: true,
        color: r.point === 5 ? "059669" : r.point === 2 ? "D97706" : "DC2626",
        bg,
      });
    } else {
      dataCell(ws.getCell(rowNum, 6), "—", { align: "center", color: "9CA3AF", bg });
    }
    const timeStr = r.checkin_time
      ? new Date(r.checkin_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" })
      : "—";
    dataCell(ws.getCell(rowNum, 7), timeStr,           { align: "center", color: isPresent ? "111827" : "9CA3AF", bg });
    dataCell(ws.getCell(rowNum, 8), r.checked_by || "—", { color: "6B7280", bg });
    dataCell(ws.getCell(rowNum, 9), r.phone || "—",      { color: "6B7280", bg });
    ws.getRow(rowNum).height = 18;
    rowNum++;
  });

  ws.views = [{ state: "frozen", ySplit: 4 }];
}

async function download(wb: ExcelJS.Workbook, fileName: string) {
  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = fileName; a.click();
  URL.revokeObjectURL(url);
}

// ── Hook ───────────────────────────────────────────────────
export function useExportExcel() {
  const [exporting, setExporting] = useState(false);

  // Export 1 lớp — dùng trong class detail page
  const exportClass = async (className: string) => {
    setExporting(true);
    try {
      const { data } = await api.get<ClassExportData>(`/leaderboard/classes/${encodeURIComponent(className)}/export`);
      const wb = new ExcelJS.Workbook();
      wb.creator = "Xứ Đoàn Checkin"; wb.created = new Date();
      const totalPoints = data.students.reduce((s,st) => s+st.total_points, 0);
      const avgRate = data.meta.total_sessions > 0 && data.meta.total_students > 0
        ? Math.round((data.students.reduce((s,st)=>s+st.total_checkins,0) / (data.meta.total_sessions * data.meta.total_students)) * 100) : 0;
      addSheet1(wb, [{
        stt:1, class_name:data.meta.class_name, nganh:data.meta.nganh,
        total_students:data.meta.total_students, total_sessions:data.meta.total_sessions,
        avg_rate:avgRate, total_points:totalPoints,
      }], data.meta.exported_at, data.meta.total_students);
      addSheet2(wb, data.students, data.meta.class_name, false);
      addSheet3(wb, data.session_summary, data.meta.total_students);
      await download(wb, `DiemDanh_${className.replace(/\s+/g,"_")}_${new Date().toLocaleDateString("en-CA")}.xlsx`);
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Export thất bại!");
    } finally { setExporting(false); }
  };

  // Export toàn đoàn — dùng trong dashboard / statistics page
  const exportAll = async () => {
    setExporting(true);
    try {
      const { data } = await api.get<AllExportData>("/statistics/export");
      const wb = new ExcelJS.Workbook();
      wb.creator = "Xứ Đoàn Checkin"; wb.created = new Date();
      addSheet1(wb, data.class_stats, data.meta.exported_at, data.meta.total_students);
      addSheet2(wb, data.students, "TOÀN ĐOÀN", true); // có thêm cột Lớp + Ngành
      addSheet3(wb, data.session_summary, data.meta.total_students);
      await download(wb, `DiemDanh_ToanDoan_${new Date().toLocaleDateString("en-CA")}.xlsx`);
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Export toàn đoàn thất bại!");
    } finally { setExporting(false); }
  };

  // Export 1 ngày cụ thể — dùng trong class detail page (date picker)
  const exportDay = async (className: string, date: string) => {
    // date: "YYYY-MM-DD"
    setExporting(true);
    try {
      // Fetch data tổng để build sheet 1-3
      const [classRes, dayRes] = await Promise.all([
        api.get<ClassExportData>(`/leaderboard/classes/${encodeURIComponent(className)}/export`),
        api.get<DayExportData>(`/leaderboard/classes/${encodeURIComponent(className)}/export/day?date=${date}`),
      ]);
      const classData = classRes.data;
      const dayData   = dayRes.data;

      const wb = new ExcelJS.Workbook();
      wb.creator = "Xứ Đoàn Checkin"; wb.created = new Date();

      // Sheet 1-3 như export thường
      const totalPoints = classData.students.reduce((s, st) => s + st.total_points, 0);
      const avgRate = classData.meta.total_sessions > 0 && classData.meta.total_students > 0
        ? Math.round((classData.students.reduce((s, st) => s + st.total_checkins, 0) / (classData.meta.total_sessions * classData.meta.total_students)) * 100) : 0;
      addSheet1(wb, [{
        stt: 1, class_name: classData.meta.class_name, nganh: classData.meta.nganh,
        total_students: classData.meta.total_students, total_sessions: classData.meta.total_sessions,
        avg_rate: avgRate, total_points: totalPoints,
      }], classData.meta.exported_at, classData.meta.total_students);
      addSheet2(wb, classData.students, classData.meta.class_name, false);
      addSheet3(wb, classData.session_summary, classData.meta.total_students);

      // Sheet 4 — Chi tiết ngày được chọn
      addSheet4(wb, dayData);

      // Tên file gồm ngày được chọn
      const dateLabel = date.replace(/-/g, "");
      await download(wb, `DiemDanh_${className.replace(/\s+/g, "_")}_${dateLabel}.xlsx`);
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Export ngày thất bại!");
    } finally { setExporting(false); }
  };

  // Export toàn đoàn theo 1 ngày cụ thể
  const exportAllDay = async (date: string) => {
    setExporting(true);
    try {
      // Fetch song song: data tổng đoàn + data ngày
      const [allRes, dayRes] = await Promise.all([
        api.get<AllExportData>("/statistics/export"),
        api.get<AllDayExportData>(`/statistics/export/day?date=${date}`),
      ]);
      const allData = allRes.data;
      const dayData = dayRes.data;

      const wb = new ExcelJS.Workbook();
      wb.creator = "Xứ Đoàn Checkin"; wb.created = new Date();

      // Sheet 1-3 như export toàn đoàn thường
      addSheet1(wb, allData.class_stats, allData.meta.exported_at, allData.meta.total_students);
      addSheet2(wb, allData.students, "TOÀN ĐOÀN", true);
      addSheet3(wb, allData.session_summary, allData.meta.total_students);

      // Sheet 4 — Chi tiết toàn đoàn ngày được chọn
      addSheet4All(wb, dayData);

      const dateLabel = date.replace(/-/g, "");
      await download(wb, `DiemDanh_ToanDoan_${dateLabel}.xlsx`);
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Export toàn đoàn theo ngày thất bại!");
    } finally { setExporting(false); }
  };

  return { exportClass, exportAll, exportDay, exportAllDay, exporting };
}