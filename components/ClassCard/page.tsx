interface ClassInfo {
  class_name: string;
  nganh: string;
  total_students: number;
  total_checkins: number;
  total_points: number;
  recent_checkins: number;
}

export function ClassCard({
  cls,
  theme,
  onClick,
}: {
  cls: ClassInfo;
  theme: { bg: string; accent: string; border: string };
  onClick: () => void;
}) {
  const avgPoints =
    cls.total_students > 0 ?
      Math.round(cls.total_points / cls.total_students)
    : 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-5 border ${theme.border} bg-linear-to-br ${theme.bg} hover:scale-[1.02] hover:brightness-110 transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-lg">{cls.class_name}</h3>
          <span className="text-xs font-medium" style={{ color: theme.accent }}>
            {cls.nganh}
          </span>
        </div>
        <span
          className="text-xl group-hover:translate-x-1 transition-transform"
          style={{ color: theme.accent }}
        >
          →
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-white/40 text-xs mb-0.5">Thiếu nhi</p>
          <p className="font-bold text-white text-lg">{cls.total_students}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs mb-0.5">Buổi điểm danh</p>
          <p className="font-bold text-white text-lg">{cls.total_checkins}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs mb-0.5">Điểm trung bình</p>
          <p className="font-bold text-lg" style={{ color: theme.accent }}>
            {avgPoints}
          </p>
        </div>
      </div>
      {cls.recent_checkins > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-white/30">
            ✅ {cls.recent_checkins} điểm danh tuần này
          </p>
        </div>
      )}
    </button>
  );
}
