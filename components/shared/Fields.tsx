import React from "react";
import { inputCls, labelCls } from "./styles";

// ── InfoRow — read-only ──────────────────────────────────────
interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}

export function InfoRow({ label, value, mono, color }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      <span
        className={`text-sm font-medium leading-snug ${mono ? "font-mono" : ""} ${color ?? "text-white/80"}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// ── Field — editable input ────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  colSpan?: number;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}

export function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
  min,
  max,
  step,
}: FieldProps) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        // inputMode cho mobile keyboard đúng loại
        inputMode={
          type === "number" ? "decimal"
          : type === "tel" ?
            "tel"
          : type === "email" ?
            "email"
          : undefined
        }
        placeholder={
          placeholder ?? (disabled ? "—" : `Nhập ${label.toLowerCase()}...`)
        }
        className={`${inputCls} ${disabled ? "opacity-50 cursor-default" : ""}`}
      />
    </div>
  );
}
