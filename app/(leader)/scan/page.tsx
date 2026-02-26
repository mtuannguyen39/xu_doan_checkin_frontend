"use client";

import { QrReader } from "react-qr-reader";
import { useState } from "react";
import { api } from "@/lib/axios";

export default function ScanPage() {
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async (data: string | null) => {
    if (data) {
      setResult(data);

      try {
        await api.post("/checkins/scan", {
          qr_code: data,
        });

        alert("Điểm danh thành công!!!");
      } catch {
        alert("Điểm danh thất bại!!!");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={(result) => {
            if (result?.getText()) {
              handleScan(result.getText());
            }
          }}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}
