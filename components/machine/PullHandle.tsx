"use client";

import { useState, useRef, useCallback } from "react";

interface PullHandleProps {
  disabled: boolean;
  onPull: () => void;
}

const HANDLE_TRAVEL = 60;
const PULL_THRESHOLD = 30;

export default function PullHandle({ disabled, onPull }: PullHandleProps) {
  const [handleState, setHandleState] = useState<"idle" | "pulling" | "returning">("idle");
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);

  const triggerPull = useCallback(() => {
    if (disabled) return;
    setHandleState("pulling");
    setDragOffset(HANDLE_TRAVEL);

    setTimeout(() => {
      onPull();
      setHandleState("returning");
      setDragOffset(0);

      setTimeout(() => {
        setHandleState("idle");
      }, 300);
    }, 300);
  }, [disabled, onPull]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      isDragging.current = true;
      startY.current = e.clientY;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || disabled) return;
      const delta = Math.max(0, Math.min(HANDLE_TRAVEL, e.clientY - startY.current));
      setDragOffset(delta);
    },
    [disabled]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragOffset >= PULL_THRESHOLD && !disabled) {
      triggerPull();
    } else {
      setDragOffset(0);
      setHandleState("idle");
    }
  }, [dragOffset, disabled, triggerPull]);

  const handleClick = useCallback(() => {
    if (isDragging.current || disabled) return;
    triggerPull();
  }, [disabled, triggerPull]);

  const ballOffset =
    handleState === "pulling"
      ? HANDLE_TRAVEL
      : handleState === "returning"
        ? 0
        : dragOffset;

  return (
    <div className="relative flex flex-col items-center select-none" style={{ width: "40px" }}>
      {/* Pivot mount */}
      <div className="machine-handle-base w-8 h-4 rounded-t-lg" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />

      {/* Shaft */}
      <div
        className="machine-handle-shaft relative w-2 rounded-sm"
        style={{
          height: `${80 + ballOffset}px`,
          boxShadow: "1px 0 2px rgba(0,0,0,0.3), -1px 0 2px rgba(0,0,0,0.3)",
          transition:
            handleState !== "idle" && !isDragging.current
              ? "height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "none",
        }}
      />

      {/* Ball grip */}
      <div
        className="machine-handle-ball relative cursor-grab active:cursor-grabbing"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          boxShadow:
            "0 4px 8px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
          transition:
            handleState !== "idle" && !isDragging.current
              ? "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "none",
          opacity: disabled ? 0.5 : 1,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
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
