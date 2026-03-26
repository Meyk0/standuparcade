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

// Classic slot machine symbols mixed in during spinning
const SLOT_SYMBOLS = ["🍒", "🍋", "🔔", "💎", "7️⃣", "🍀", "⭐", "🍊", "🎰", "BAR"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns true if the item is a symbol (not a name) */
function isSymbol(item: string): boolean {
  return SLOT_SYMBOLS.includes(item);
}

export default function SlotReelColumn({
  names,
  winnerName,
  status,
  onStopped,
}: SlotReelColumnProps) {
  const rafRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const phaseRef = useRef<"idle" | "spinning" | "decelerating" | "stopped">("idle");
  const [displayItems, setDisplayItems] = useState<string[]>(["🎰", "???", "🍒"]);
  const [translateY, setTranslateY] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const [highlightCenter, setHighlightCenter] = useState(false);
  const namesRef = useRef(names);
  const winnerRef = useRef(winnerName);

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

  // Build a spin strip mixing names and slot symbols
  const buildSpinStrip = useCallback(() => {
    const allNames = namesRef.current.length > 0 ? namesRef.current : ["???"];
    const strip: string[] = [];
    const count = Math.max(40, allNames.length * 5);
    for (let i = 0; i < count; i++) {
      // ~40% chance of a slot symbol, 60% chance of a name
      if (Math.random() < 0.4) {
        strip.push(pickRandom(SLOT_SYMBOLS));
      } else {
        strip.push(allNames[i % allNames.length]);
      }
    }
    return strip;
  }, []);

  const startSpinning = useCallback(() => {
    stopAnimation();
    phaseRef.current = "spinning";
    setIsIdle(false);
    setHighlightCenter(false);

    const strip = buildSpinStrip();
    setDisplayItems(strip);

    posRef.current = 0;
    let lastTime = performance.now();
    const speed = -ROW_HEIGHT * 14;

    const animate = (time: number) => {
      if (phaseRef.current !== "spinning") return;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      posRef.current += speed * dt;

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

  const startDecelerating = useCallback(() => {
    stopAnimation();
    phaseRef.current = "decelerating";

    const winner = winnerRef.current;
    const allNames = namesRef.current.length > 0 ? namesRef.current : ["???"];

    const finalStrip: string[] = [];
    const runwayLength = 15;

    // Runway: mix of names and symbols for that classic feel
    const others = allNames.filter((n) => n !== winner);
    const namePool = others.length > 0 ? others : allNames;
    for (let i = 0; i < runwayLength; i++) {
      if (Math.random() < 0.35) {
        finalStrip.push(pickRandom(SLOT_SYMBOLS));
      } else {
        finalStrip.push(pickRandom(namePool));
      }
    }

    // Final 3 visible: [symbol/name above, WINNER, symbol/name below]
    finalStrip.push(pickRandom(SLOT_SYMBOLS));
    finalStrip.push(winner);
    finalStrip.push(pickRandom(SLOT_SYMBOLS));

    setDisplayItems(finalStrip);

    const winnerIndex = runwayLength + 1;
    const targetTranslateY = -(winnerIndex - 1) * ROW_HEIGHT;

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

      const eased = 1 - Math.pow(1 - progress, 3);

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
        posRef.current = targetTranslateY;
        setTranslateY(targetTranslateY);
        phaseRef.current = "stopped";
        setHighlightCenter(true);
        onStopped?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [stopAnimation, onStopped]);

  const resetToIdle = useCallback(() => {
    stopAnimation();
    phaseRef.current = "idle";
    posRef.current = 0;
    setTranslateY(0);
    setDisplayItems(["🍒", "???", "7️⃣"]);
    setIsIdle(true);
    setHighlightCenter(false);
  }, [stopAnimation]);

  useEffect(() => {
    if (status === "spinning" && phaseRef.current !== "spinning") {
      startSpinning();
    } else if (status === "stopping" && phaseRef.current === "spinning") {
      startDecelerating();
    } else if (status === "idle" && phaseRef.current !== "idle") {
      resetToIdle();
    }
  }, [status, startSpinning, startDecelerating, resetToIdle]);

  useEffect(() => {
    return stopAnimation;
  }, [stopAnimation]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: VISIBLE_ROWS * ROW_HEIGHT }}
    >
      <div
        className="will-change-transform"
        style={{
          transform: `translateY(${isIdle ? 0 : translateY}px)`,
        }}
      >
        {displayItems.map((item, i) => {
          const isWinnerItem = highlightCenter && item === winnerRef.current &&
            Math.abs(posRef.current + (i - 1) * ROW_HEIGHT) < ROW_HEIGHT * 0.5;
          const sym = isSymbol(item);

          return (
            <div
              key={`${i}-${item}`}
              className="flex items-center justify-center font-bold uppercase tracking-wider"
              style={{
                height: ROW_HEIGHT,
                fontSize: sym
                  ? "1.8rem"
                  : item.length > 10
                    ? "0.75rem"
                    : item.length > 7
                      ? "0.875rem"
                      : "1.1rem",
                color: isWinnerItem
                  ? "var(--skin-accent)"
                  : "var(--reel-text, var(--skin-text))",
                textShadow: isWinnerItem
                  ? "0 0 10px var(--skin-accent)"
                  : "none",
              }}
            >
              <span className="truncate max-w-[140px] px-2">{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ROW_HEIGHT, VISIBLE_ROWS };
