"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Member } from "@/lib/types";

interface SlotReelProps {
  status: "idle" | "spinning" | "winner";
  members: Member[];
  currentWinner: Member | null;
}

export default function SlotReel({
  status,
  members,
  currentWinner,
}: SlotReelProps) {
  const [displayName, setDisplayName] = useState("???");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status === "spinning" && members.length > 0) {
      setIsRevealing(false);
      let speed = 60;
      let elapsed = 0;
      const totalDuration = 2500;

      const cycle = () => {
        const randomMember =
          members[Math.floor(Math.random() * members.length)];
        setDisplayName(randomMember.name.toUpperCase());
        elapsed += speed;

        if (elapsed < totalDuration) {
          // Slow down progressively
          speed = Math.min(300, speed * 1.08);
          intervalRef.current = setTimeout(cycle, speed);
        } else {
          // Reveal the winner
          if (currentWinner) {
            setDisplayName(currentWinner.name.toUpperCase());
          }
          setIsRevealing(true);
        }
      };

      stopAnimation();
      cycle();
    } else if (status === "winner" && currentWinner) {
      stopAnimation();
      setDisplayName(currentWinner.name.toUpperCase());
      setIsRevealing(true);
    } else if (status === "idle") {
      stopAnimation();
      setDisplayName("???");
      setIsRevealing(false);
    }

    return stopAnimation;
  }, [status, members, currentWinner, stopAnimation]);

  return (
    <div className="relative">
      {/* Reel frame */}
      <div className="border-4 border-skin-border rounded-lg bg-skin-reel-bg p-4 sm:p-8 overflow-hidden">
        {/* Decorative top bar */}
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                status === "spinning"
                  ? "bg-skin-accent animate-pulse"
                  : status === "winner"
                    ? "bg-skin-accent"
                    : "bg-skin-muted"
              }`}
            />
          ))}
        </div>

        {/* Name display */}
        <div className="min-h-[80px] sm:min-h-[120px] flex items-center justify-center">
          <span
            className={`text-2xl sm:text-5xl font-bold tracking-wider text-center break-all ${
              isRevealing
                ? "text-skin-accent animate-winner-flash"
                : status === "spinning"
                  ? "text-skin-text"
                  : "text-skin-text-secondary"
            }`}
          >
            {displayName}
          </span>
        </div>

        {/* Tagline */}
        {status === "winner" && currentWinner?.tagline && (
          <div className="text-center mt-4">
            <span className="text-sm sm:text-base text-skin-accent-secondary italic">
              {currentWinner.tagline}
            </span>
          </div>
        )}

        {/* Decorative bottom bar */}
        <div className="flex justify-center gap-1 mt-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-sm ${
                status === "spinning"
                  ? "bg-skin-accent-secondary animate-pulse"
                  : "bg-skin-muted"
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
