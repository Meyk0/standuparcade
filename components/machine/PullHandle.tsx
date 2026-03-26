"use client";

import { useState, useCallback } from "react";

interface PullHandleProps {
  disabled: boolean;
  onPull: () => void;
}

export default function PullHandle({ disabled, onPull }: PullHandleProps) {
  const [pulling, setPulling] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || pulling) return;

    setPulling(true);

    // Animate pull down, then trigger spin, then spring back
    setTimeout(() => {
      onPull();
      setTimeout(() => {
        setPulling(false);
      }, 300);
    }, 250);
  }, [disabled, pulling, onPull]);

  return (
    <div
      className="flex flex-col items-center select-none cursor-pointer"
      style={{ width: "40px" }}
      onClick={handleClick}
    >
      {/* Pivot mount */}
      <div
        className="machine-handle-base w-8 h-4 rounded-t-lg"
        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
      />

      {/* Shaft — grows when pulled */}
      <div
        className="machine-handle-shaft w-2 rounded-sm"
        style={{
          height: pulling ? "140px" : "80px",
          boxShadow: "1px 0 2px rgba(0,0,0,0.3), -1px 0 2px rgba(0,0,0,0.3)",
          transition: "height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />

      {/* Ball grip */}
      <div
        className="machine-handle-ball"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          boxShadow:
            "0 4px 8px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
          opacity: disabled ? 0.4 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {/* Shine */}
        <div
          className="absolute rounded-full"
          style={{
            width: "12px",
            height: "8px",
            top: "6px",
            left: "8px",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.6), transparent)",
          }}
        />
      </div>
    </div>
  );
}
