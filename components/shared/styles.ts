export const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 " +
  "text-white/85 text-sm outline-none focus:border-blue-500/50 " +
  "transition-colors placeholder-white/20 scheme:dark";

export const labelCls =
  "block text-[11px] font-semibold text-white/35 uppercase tracking-wide mb-1.5";

export const btnPrimaryCls =
  "px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 " +
  "text-white text-sm font-bold transitionc-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const btnSecondaryCls =
  "px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 " +
  "text-white/60 text-sm font-semibold transition-colors disabled:opacity-50";

// Score type config
export const SCORE_TYPES = [
  {
    type: "kiem_tra_15p",
    label: "Kiểm tra 15 phút",
    color: "text-blue-400",
    accent: "border-l-blue-400",
  },
  {
    type: "kiem_tra_1t",
    label: "Kiểm tra 1 tiết",
    color: "text-violet-400",
    accent: "border-l-violet-400",
  },
  {
    type: "hk1",
    label: "Thi học kì 1",
    color: "text-emerald-400",
    accent: "border-l-emerald-400",
  },
  {
    type: "hk2",
    label: "Thi học kì 2",
    color: "text-amber-400",
    accent: "border-l-amber-400",
  },
  {
    type: "tb_ca_nam",
    label: "TB cả năm",
    color: "text-red-400",
    accent: "border-l-red-400",
  },
  {
    type: "tong_cuoi_ki",
    label: "Tổng cuối kì",
    color: "text-orange-400",
    accent: "border-l-orange-400",
  },
] as const;

// Assignment role config
export const ROLE_LABELS: Record<string, string> = {
  HUYNH_TRUONG: "Huynh Trưởng",
  DU_TRUONG: "Dự Trưởng",
  SOUR: "Sour",
};

export const ROLE_ICONS: Record<string, string> = {
  HUYNH_TRUONG: "🌟",
  DU_TRUONG: "⭐",
  SOUR: "✨",
};

// Taiwind bg + text + border per role
export const ROLE_STYLE: Record<
  string,
  { bg: string; text: string; border: string; avatar: string }
> = {
  HUYNH_TRUONG: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    avatar: "bg-amber-500/20 text-amber-400",
  },
  DU_TRUONG: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    avatar: "bg-blue-500/20 text-blue-400",
  },
  SOUR: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
    avatar: "bg-violet-500/20 text-violet-400",
  },
};
