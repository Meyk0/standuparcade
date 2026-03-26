"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SlotReelColumn, { ROW_HEIGHT, VISIBLE_ROWS } from "./SlotReelColumn";

interface ReelWindowProps {
  names: string[];
  winnerName: string;
  status: "idle" | "spinning" | "winner";
  onAllReelsStopped: () => void;
}

const REEL_STOP_DELAYS = [1500, 2000, 2500];

export default function ReelWindow({
  names,
  winnerName,
  status,
  onAllReelsStopped,
}: ReelWindowProps) {
  const [reelStatuses, setReelStatuses] = useState<
    ("idle" | "spinning" | "stopping" | "stopped")[]
  >(["idle", "idle", "idle"]);
  const stoppedCountRef = useRef(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasCalledStoppedRef = useRef(false);
  const prevStatusRef = useRef(status);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === "spinning" && prevStatus !== "spinning") {
      // Starting a new spin
      clearTimers();
      stoppedCountRef.current = 0;
      hasCalledStoppedRef.current = false;
      setReelStatuses(["spinning", "spinning", "spinning"]);

      const timers = REEL_STOP_DELAYS.map((delay, index) =>
        setTimeout(() => {
          setReelStatuses((prev) => {
            const next = [...prev] as ("idle" | "spinning" | "stopping" | "stopped")[];
            next[index] = "stopping";
            return next;
          });
        }, delay)
      );
      timersRef.current = timers;
    } else if (status === "idle" && prevStatus !== "idle") {
      // Resetting
      clearTimers();
      stoppedCountRef.current = 0;
      hasCalledStoppedRef.current = false;
      setReelStatuses(["idle", "idle", "idle"]);
    }
    // "winner" status: don't change anything, reels stay in their stopped state
  }, [status, clearTimers]);

  const handleReelStopped = useCallback(
    (reelIndex: number) => {
      setReelStatuses((prev) => {
        const next = [...prev] as ("idle" | "spinning" | "stopping" | "stopped")[];
        next[reelIndex] = "stopped";
        return next;
      });

      stoppedCountRef.current += 1;
      if (stoppedCountRef.current >= 3 && !hasCalledStoppedRef.current) {
        hasCalledStoppedRef.current = true;
        onAllReelsStopped();
      }
    },
    [onAllReelsStopped]
  );

  const windowHeight = VISIBLE_ROWS * ROW_HEIGHT;

  return (
    <div className="relative">
      <div
        className="machine-reel-bg relative rounded-lg overflow-hidden"
        style={{
          height: windowHeight,
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.6), inset 0 -4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* Three reel columns */}
        <div className="flex h-full">
          {[0, 1, 2].map((reelIndex) => (
            <div
              key={reelIndex}
              className="flex-1 relative"
              style={{
                borderRight:
                  reelIndex < 2
                    ? "2px solid var(--reel-divider, rgba(255,255,255,0.1))"
                    : "none",
              }}
            >
              <SlotReelColumn
                names={names}
                winnerName={winnerName}
                reelIndex={reelIndex}
                status={reelStatuses[reelIndex]}
                onStopped={() => handleReelStopped(reelIndex)}
              />
            </div>
          ))}
        </div>

        {/* Glass reflection overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
          }}
        />

        {/* Winner payline arrows */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderLeft: "14px solid var(--reel-winner-line, var(--skin-accent))",
            marginLeft: "2px",
            filter: "drop-shadow(0 0 4px var(--skin-accent))",
          }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderRight: "14px solid var(--reel-winner-line, var(--skin-accent))",
            marginRight: "2px",
            filter: "drop-shadow(0 0 4px var(--skin-accent))",
          }}
        />
      </div>
    </div>
  );
}
