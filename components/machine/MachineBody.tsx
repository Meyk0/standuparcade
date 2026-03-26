"use client";

import { ReactNode } from "react";

interface MachineBodyProps {
  children: ReactNode;
  total: number;
  remaining: number;
}

export default function MachineBody({ children, total, remaining }: MachineBodyProps) {
  return (
    <div
      className="relative px-4 sm:px-6 py-4"
      style={{
        background: "var(--machine-body-bg, linear-gradient(180deg, #d0d0d0 0%, #a0a0a0 50%, #808080 100%))",
        boxShadow: "var(--machine-body-shadow, inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.3))",
      }}
    >
      {/* Rivets top-left and top-right */}
      <div className="absolute top-3 left-3 w-3 h-3 rounded-full"
        style={{
          background: "var(--rivet-color, radial-gradient(circle at 35% 35%, #e0e0e0, #606060))",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.5)",
        }}
      />
      <div className="absolute top-3 right-3 w-3 h-3 rounded-full"
        style={{
          background: "var(--rivet-color, radial-gradient(circle at 35% 35%, #e0e0e0, #606060))",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.5)",
        }}
      />

      {/* "WINS" label */}
      <div className="text-center mb-3">
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-bold"
          style={{ color: "var(--machine-label-color, #444)" }}
        >
          ★ STANDUP SLOTS ★
        </span>
      </div>

      {/* Reel window area */}
      {children}

      {/* Credits / Coins display */}
      <div className="flex items-center justify-between mt-3 px-2">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] uppercase tracking-wider font-bold"
            style={{ color: "var(--machine-label-color, #444)" }}
          >
            CREDITS
          </span>
          <div className="flex gap-1">
            {[...Array(total)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  background: i < remaining
                    ? "var(--light-color-2, #ffd700)"
                    : "var(--machine-label-color, #444)",
                  boxShadow: i < remaining
                    ? "0 0 4px var(--light-color-2, #ffd700)"
                    : "none",
                  opacity: i < remaining ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] uppercase tracking-wider font-bold"
            style={{ color: "var(--machine-label-color, #444)" }}
          >
            REMAINING
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: "var(--marquee-text, #ffd700)" }}
          >
            {remaining}
          </span>
        </div>
      </div>
    </div>
  );
}
