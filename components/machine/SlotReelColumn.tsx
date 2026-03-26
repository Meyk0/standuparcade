"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface SlotReelColumnProps {
  names: string[];
  winnerName: string;
  reelIndex: number; // 0, 1, 2 for stagger timing
  status: "idle" | "spinning" | "stopping" | "stopped";
  onStopped?: () => void;
}

const ROW_HEIGHT = 64; // px per name row
const VISIBLE_ROWS = 3; // names visible in the window

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SlotReelColumn({
  names,
  winnerName,
  status,
  onStopped,
}: SlotReelColumnProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [phase, setPhase] = useState<"idle" | "spinning" | "decelerating" | "stopped">("idle");

  // Build the name strip: repeated shuffled names with winner at a known target position
  const { strip, targetIndex } = useMemo(() => {
    if (names.length === 0) return { strip: ["???"], targetIndex: 0 };

    const repeats = Math.max(3, Math.ceil(30 / names.length));
    const segments: string[] = [];

    for (let i = 0; i < repeats; i++) {
      segments.push(...shuffleArray(names));
    }

    // Place winner near the end so there's enough runway to spin through
    const targetIdx = segments.length - Math.floor(names.length / 2) - 1;
    segments[targetIdx] = winnerName;

    // Ensure neighbors aren't also the winner (for visual clarity)
    if (segments[targetIdx - 1] === winnerName && names.length > 1) {
      const alt = names.find((n) => n !== winnerName) || names[0];
      segments[targetIdx - 1] = alt;
    }
    if (segments[targetIdx + 1] === winnerName && names.length > 1) {
      const alt = names.find((n) => n !== winnerName) || names[0];
      segments[targetIdx + 1] = alt;
    }

    return { strip: segments, targetIndex: targetIdx };
  }, [names, winnerName]);

  // Target Y position: winner should be in the center row
  const targetY = useMemo(() => {
    return -(targetIndex - 1) * ROW_HEIGHT;
  }, [targetIndex]);

  // Reset to idle display
  const resetToIdle = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    positionRef.current = 0;
    velocityRef.current = 0;
    setTranslateY(0);
    setPhase("idle");
  }, []);

  // Start fast spinning
  const startSpinning = useCallback(() => {
    setPhase("spinning");
    const speed = -ROW_HEIGHT * 12; // pixels per second (fast)
    velocityRef.current = speed;
    positionRef.current = 0;

    let lastTime = performance.now();
    const totalStripHeight = strip.length * ROW_HEIGHT;

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      positionRef.current += velocityRef.current * dt;

      // Wrap around to create infinite scroll effect
      if (positionRef.current < -totalStripHeight + VISIBLE_ROWS * ROW_HEIGHT) {
        positionRef.current += totalStripHeight / 2;
      }

      setTranslateY(positionRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [strip.length]);

  // Decelerate to target
  const startDecelerating = useCallback(() => {
    setPhase("decelerating");

    const startPos = positionRef.current;
    const startTime = performance.now();
    const duration = 800; // ms for deceleration

    // Ensure we travel enough distance and land on target
    // Adjust target to be "below" current position (continuing scroll direction)
    let adjustedTarget = targetY;
    while (adjustedTarget > startPos) {
      adjustedTarget -= strip.length * ROW_HEIGHT;
    }
    // Make sure we travel at least one full strip cycle for dramatic effect
    if (startPos - adjustedTarget < 5 * ROW_HEIGHT) {
      adjustedTarget -= Math.ceil(names.length) * ROW_HEIGHT;
    }

    const distance = adjustedTarget - startPos;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out with slight overshoot
      const eased = 1 - Math.pow(1 - progress, 3);

      // Add bounce at the end
      let bounce = 0;
      if (progress > 0.85) {
        const bounceProgress = (progress - 0.85) / 0.15;
        bounce = Math.sin(bounceProgress * Math.PI) * ROW_HEIGHT * 0.15;
      }

      const currentPos = startPos + distance * eased + bounce;
      positionRef.current = currentPos;
      setTranslateY(currentPos);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Snap exactly to target
        positionRef.current = adjustedTarget;
        setTranslateY(adjustedTarget);
        setPhase("stopped");
        onStopped?.();
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [targetY, strip.length, names.length, onStopped]);

  // React to status changes
  useEffect(() => {
    if (status === "spinning" && phase === "idle") {
      startSpinning();
    } else if (status === "stopping" && phase === "spinning") {
      startDecelerating();
    } else if (status === "idle") {
      resetToIdle();
    }
  }, [status, phase, startSpinning, startDecelerating, resetToIdle]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Idle display: show "???" centered
  const idleStrip = ["???", "???", "???"];

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: VISIBLE_ROWS * ROW_HEIGHT }}
    >
      {/* Winner line indicator */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none border-t-2 border-b-2"
        style={{
          top: ROW_HEIGHT,
          height: ROW_HEIGHT,
          borderColor: "var(--reel-winner-line, var(--skin-accent))",
        }}
      />

      {/* Name strip */}
      <div
        ref={stripRef}
        className="will-change-transform"
        style={{
          transform: `translateY(${phase === "idle" ? 0 : translateY}px)`,
        }}
      >
        {(phase === "idle" ? idleStrip : strip).map((name, i) => (
          <div
            key={`${i}-${name}`}
            className="flex items-center justify-center font-bold uppercase tracking-wider"
            style={{
              height: ROW_HEIGHT,
              fontSize: name.length > 10 ? "0.75rem" : name.length > 7 ? "0.875rem" : "1.1rem",
              color:
                phase === "stopped" &&
                i === targetIndex
                  ? "var(--skin-accent)"
                  : "var(--reel-text, var(--skin-text))",
              textShadow:
                phase === "stopped" && i === targetIndex
                  ? "0 0 10px var(--skin-accent)"
                  : "none",
            }}
          >
            <span className="truncate max-w-[140px] px-2">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ROW_HEIGHT, VISIBLE_ROWS };
