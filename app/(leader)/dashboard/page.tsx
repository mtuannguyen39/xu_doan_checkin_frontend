"use client";

import { api } from "@/lib/axios";
import { useEffect, useState } from "react";

export default function LeaderDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const statRes = await api.get("/stats/overview");
      const classRes = await api.get("/classes");

      setStats(statRes.data);
      setClasses(classRes.data);
    };
    fetchData();
  }, []);

  if (!stats) return <p>HỔNG CÓ GÌ Ở ĐÂY HẾT ...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard huynh trưởng</h1>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <GlassCard title="Điểm danh mỗi tuần" value={stats.today_checkins} />
        <GlassCard title="Tổng thiếu nhi" value={stats.total_students} />
        <GlassCard title="Tổng đã điểm danh" value={stats.total_checkins} />
      </div>

      {/* Classes */}
      <h2 className="text-xl font-semibold mb-4">Theo lớp</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div
            className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-lg border border-white/20 hover:scale-105 transition cursor-pointer"
            key={cls.class_name}
          >
            <h3 className="text-lg font-bold">{cls.class_name}</h3>
            <p>{cls.total_students} học sinh</p>
            <p>{cls.today_checkins} điểm danh hôm nay</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlassCard({ title, value }: any) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-lg border border-white/20">
      <h3 className="text-lg">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
