"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";

export default function StudentQR() {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("student");
    if (data) {
      setStudent(JSON.parse(data));
    }
  }, []);

  if (!student) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 p-4">
      <div className="rounded-3xl bg-white/20 backdrop-blur-xl p-8 shadow-xl text-center border border-white/30">
        <h2 className="text-xl font-bold text-white mb-2">
          {student.full_name}
        </h2>

        <p className="text-white/80 mb-4">
          Lớp {student.class_name} - {student.nganh}
        </p>

        <div className="bg-white p-4 rounded-xl inline-block">
          <QRCodeCanvas value={student.qr_code} size={220} />
        </div>

        <p className="mt-4 text-white font-semibold">ID: {student.id}</p>
      </div>
    </div>
  );
}
