"use client";

import { ReactNode } from "react";

interface MachineBodyProps {
  children: ReactNode;
  total: number;
  remaining: number;
}

export default function MachineBody({ children, total, remaining }: MachineBodyProps) {
  return (
    <div className="machine-body relative px-4 sm:px-6 py-4">
      {/* Rivets */}
      <div className="machine-rivet absolute top-3 left-3 w-3 h-3 rounded-full" />
      <div className="machine-rivet absolute top-3 right-3 w-3 h-3 rounded-full" />

      {/* Label */}
      <div className="text-center mb-3">
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-bold"
          style={{ color: "var(--machine-label-color)" }}
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
            style={{ color: "var(--machine-label-color)" }}
          >
            CREDITS
          </span>
          <div className="flex gap-1">
            {[...Array(total)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  background: i < remaining ? "var(--light-color-2)" : "var(--machine-label-color)",
                  boxShadow: i < remaining ? "0 0 4px var(--light-color-2)" : "none",
                  opacity: i < remaining ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] uppercase tracking-wider font-bold"
            style={{ color: "var(--machine-label-color)" }}
          >
            REMAINING
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: "var(--marquee-text)" }}
          >
            {remaining}
          </span>
        </div>
      </div>
    </div>
  );
}
