"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { QRCodeCanvas } from "qrcode.react";

export default function StudentPage() {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const res = await api.get("/students");
      setStudent(res.data);
    };
    fetchStudent();
  }, []);

  if (!student) return <p>Loading....</p>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-center text-xl font-bold">
          {student.full_name}
        </h2>

        <QRCodeCanvas value={student.qr_code} size={220} />

        <p className="mt-4 text-center font-semibold">ID: {student.id}</p>
      </div>
    </div>
  );
}
