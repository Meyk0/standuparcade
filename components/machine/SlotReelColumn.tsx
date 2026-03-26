"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SlotReelColumnProps {
  names: string[];
  winnerName: string;
  reelIndex: number;
  status: "idle" | "spinning" | "stopping" | "stopped";
  onStopped?: () => void;
}

const ROW_HEIGHT = 64;
const VISIBLE_ROWS = 3;

export default function SlotReelColumn({
  names,
  winnerName,
  status,
  onStopped,
}: SlotReelColumnProps) {
  const rafRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const phaseRef = useRef<"idle" | "spinning" | "decelerating" | "stopped">("idle");
  const [displayItems, setDisplayItems] = useState<string[]>(["???", "???", "???"]);
  const [translateY, setTranslateY] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const [highlightCenter, setHighlightCenter] = useState(false);
  const namesRef = useRef(names);
  const winnerRef = useRef(winnerName);

  // Keep refs in sync
  useEffect(() => {
    namesRef.current = names;
    winnerRef.current = winnerName;
  }, [names, winnerName]);

  const stopAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Build a long strip for spinning display
  const buildSpinStrip = useCallback(() => {
    const allNames = namesRef.current.length > 0 ? namesRef.current : ["???"];
    const strip: string[] = [];
    // Build a strip of ~40 items for smooth scrolling
    const count = Math.max(40, allNames.length * 5);
    for (let i = 0; i < count; i++) {
      strip.push(allNames[i % allNames.length]);
    }
    return strip;
  }, []);

  // Start fast spinning
  const startSpinning = useCallback(() => {
    stopAnimation();
    phaseRef.current = "spinning";
    setIsIdle(false);
    setHighlightCenter(false);

    const strip = buildSpinStrip();
    setDisplayItems(strip);

    posRef.current = 0;
    let lastTime = performance.now();
    const speed = -ROW_HEIGHT * 14; // px/sec

    const animate = (time: number) => {
      if (phaseRef.current !== "spinning") return;

      const dt = (time - lastTime) / 1000;
      lastTime = time;

      posRef.current += speed * dt;

      // Wrap around seamlessly
      const stripHeight = strip.length * ROW_HEIGHT;
      const wrapPoint = -stripHeight / 2;
      if (posRef.current < wrapPoint) {
        posRef.current += stripHeight / 2;
      }

      setTranslateY(posRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [stopAnimation, buildSpinStrip]);

  // Decelerate and land on winner
  const startDecelerating = useCallback(() => {
    stopAnimation();
    phaseRef.current = "decelerating";

    const winner = winnerRef.current;
    const allNames = namesRef.current.length > 0 ? namesRef.current : ["???"];

    // Build the final landing strip: [neighbor above, WINNER, neighbor below]
    // Plus extra items above for the deceleration runway
    const finalStrip: string[] = [];
    const runwayLength = 15; // names to scroll through during decel

    // Pick random non-winner names for the runway
    const others = allNames.filter((n) => n !== winner);
    const pool = others.length > 0 ? others : allNames;
    for (let i = 0; i < runwayLength; i++) {
      finalStrip.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    // Add the final 3 visible names: [above, WINNER, below]
    finalStrip.push(pool[Math.floor(Math.random() * pool.length)]); // above
    finalStrip.push(winner); // center (this is the target)
    finalStrip.push(pool[Math.floor(Math.random() * pool.length)]); // below

    setDisplayItems(finalStrip);

    // Target: winner should be in center row (index = runwayLength + 1)
    // translateY = -(winnerIndex - 1) * ROW_HEIGHT to show it in center
    const winnerIndex = runwayLength + 1;
    const targetTranslateY = -(winnerIndex - 1) * ROW_HEIGHT;

    // Start from top of the strip (scrolling down through runway)
    const startY = 0;
    posRef.current = startY;
    setTranslateY(startY);

    const startTime = performance.now();
    const duration = 800;
    const totalDistance = targetTranslateY - startY;

    const animate = (time: number) => {
      if (phaseRef.current !== "decelerating") return;

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);

      // Subtle bounce near end
      let bounce = 0;
      if (progress > 0.8) {
        const bounceT = (progress - 0.8) / 0.2;
        bounce = Math.sin(bounceT * Math.PI) * ROW_HEIGHT * 0.12;
      }

      const currentY = startY + totalDistance * eased + bounce;
      posRef.current = currentY;
      setTranslateY(currentY);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Snap to exact target
        posRef.current = targetTranslateY;
        setTranslateY(targetTranslateY);
        phaseRef.current = "stopped";
        setHighlightCenter(true);
        onStopped?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [stopAnimation, onStopped]);

  // Reset to idle
  const resetToIdle = useCallback(() => {
    stopAnimation();
    phaseRef.current = "idle";
    posRef.current = 0;
    setTranslateY(0);
    setDisplayItems(["???", "???", "???"]);
    setIsIdle(true);
    setHighlightCenter(false);
  }, [stopAnimation]);

  // React to status changes
  useEffect(() => {
    if (status === "spinning" && phaseRef.current !== "spinning") {
      startSpinning();
    } else if (status === "stopping" && phaseRef.current === "spinning") {
      startDecelerating();
    } else if (status === "idle" && phaseRef.current !== "idle") {
      resetToIdle();
    }
  }, [status, startSpinning, startDecelerating, resetToIdle]);

  // Cleanup on unmount
  useEffect(() => {
    return stopAnimation;
  }, [stopAnimation]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: VISIBLE_ROWS * ROW_HEIGHT }}
    >
      {/* Name strip */}
      <div
        className="will-change-transform"
        style={{
          transform: `translateY(${isIdle ? 0 : translateY}px)`,
        }}
      >
        {displayItems.map((name, i) => {
          // Determine if this item is the winner in the center
          const isWinnerItem = highlightCenter && name === winnerRef.current &&
            Math.abs(posRef.current + (i - 1) * ROW_HEIGHT) < ROW_HEIGHT * 0.5;

          return (
            <div
              key={`${i}-${name}`}
              className="flex items-center justify-center font-bold uppercase tracking-wider"
              style={{
                height: ROW_HEIGHT,
                fontSize: name.length > 10 ? "0.75rem" : name.length > 7 ? "0.875rem" : "1.1rem",
                color: isWinnerItem
                  ? "var(--skin-accent)"
                  : "var(--reel-text, var(--skin-text))",
                textShadow: isWinnerItem
                  ? "0 0 10px var(--skin-accent)"
                  : "none",
              }}
            >
              <span className="truncate max-w-[140px] px-2">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ROW_HEIGHT, VISIBLE_ROWS };
