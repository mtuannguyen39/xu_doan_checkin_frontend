import React from "react";

interface CardProps {
  title: string;
  icon: string;
  accent?: string; // Tailwind border-l color class, e.g. "border-l-blue-400"
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Card({ title, icon, accent, action, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-2.5">
          {accent && (
            <div
              className={`w-0.5 h-5 rounded-full ${accent.replace("border-l-", "bg-")}`}
            />
          )}
          <span className="text-base leading-none">{icon}</span>
          <span className="text-sm font-bold text-white/85">{title}</span>
        </div>
        {action && <div>{action}</div>}
      </div>
      {/* Body */}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}