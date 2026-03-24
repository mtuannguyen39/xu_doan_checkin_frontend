"use client";

import { SchoolYear, StudentHocBa, Tab } from "@/components/shared/types";
import { useRouter } from "next/navigation";

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: "info", icon: "👤", label: "Thông tin" },
  { key: "scores", icon: "📚", label: "Điểm số" },
  { key: "assignments", icon: "👥", label: "Phụ trách" },
];

interface HocBaNavbarProps {
  student: StudentHocBa;
  years: SchoolYear[];
  selectedYearId: number | null;
  onYearChange: (id: number) => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function HocBaNavBar({
  student,
  years,
  selectedYearId,
  onYearChange,
  activeTab,
  onTabChange,
}: HocBaNavbarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 border-b border-white/6 bg-[#080c14]/92 backdrop-blur-xl">
      <div className="max-w-225 mx-auto px-4">
        {/* Row 1: Back + Student Info + Year selector */}
        <div className="flex items-center gap-2.5 pt-3 pb-2.5 border-b border-white/4">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 text-white/55 hover:text-white text-xs font-semibold transition-all shrink-0"
          >
            Quay lại
          </button>

          {/* Avatar + name */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl shrink-0 bg-linear-to-br from-blue-500 to-indifo-600 flex items-center justify-center text-sm font-black text-white">
              {student.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-white truncate">
                {student.full_name}
              </p>
              <p className="text-[11px] text-white/35">
                {student.saint_name} -{" "}
                <span className="font-mono">{student.id}</span> - Lớp{" "}
                {student.class_name}
              </p>
            </div>
          </div>

          {/* Year selector */}
          <select
            value={selectedYearId ?? ""}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="bg-white/6 border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs font-semibold outline-none cursor-pointer scheme:dark hover:bg-white/10 active:bg-white/15 transition-colors shrink-0 touch-manipulation max-w-32.5"
          >
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
                {y.is_active ? " (HĐ)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Tabs */}
        {/* Scrollable on very small screens, flex on normal */}
        <div className="flex overflow-x-auto [-webkit-overflow-scrolling:touch] scrollbar-none gap-0.5 pt-1">
          {TABS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex-1 justify-center touch-manipulation ${activeTab === key ? "text-blue-400 border-blue-400 bg-blue/500/8" : "text-white/40 border-transparent hover:text-white/65 active:bg-white/5"}`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
