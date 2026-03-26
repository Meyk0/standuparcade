"use client";

interface MachineMarqueeProps {
  teamName: string;
  isSpinning: boolean;
}

export default function MachineMarquee({ teamName, isSpinning }: MachineMarqueeProps) {
  const lightCount = 12;

  return (
    <div className="relative">
      {/* Marquee panel */}
      <div
        className="relative rounded-t-2xl px-4 py-3 text-center overflow-hidden"
        style={{
          background: "var(--marquee-bg, linear-gradient(180deg, #2a1a0a, #1a0f05))",
          boxShadow: "var(--marquee-glow, 0 0 20px rgba(255, 215, 0, 0.3))",
          borderBottom: "3px solid var(--machine-border, #c0a050)",
        }}
      >
        {/* Chase lights */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <div className="flex flex-col gap-2 py-1">
            {[...Array(Math.ceil(lightCount / 4))].map((_, i) => (
              <div
                key={`l-${i}`}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "var(--marquee-light-color, #ffd700)",
                  boxShadow: `0 0 6px var(--marquee-light-color, #ffd700)`,
                  animation: `chase-light 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: isSpinning ? 1 : 0.5,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 py-1">
            {[...Array(Math.ceil(lightCount / 4))].map((_, i) => (
              <div
                key={`r-${i}`}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "var(--marquee-light-color, #ffd700)",
                  boxShadow: `0 0 6px var(--marquee-light-color, #ffd700)`,
                  animation: `chase-light 1.5s ease-in-out infinite`,
                  animationDelay: `${(i + 3) * 0.2}s`,
                  opacity: isSpinning ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Top row lights */}
        <div className="flex justify-center gap-3 mb-2 relative z-10">
          {[...Array(Math.ceil(lightCount / 2))].map((_, i) => (
            <div
              key={`t-${i}`}
              className="w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0
                  ? "var(--light-color-1, #ff4444)"
                  : "var(--light-color-2, #ffd700)",
                boxShadow: `0 0 6px ${i % 2 === 0 ? "var(--light-color-1, #ff4444)" : "var(--light-color-2, #ffd700)"}`,
                animation: `chase-light 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Title text */}
        <h2
          className="relative z-10 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] truncate"
          style={{
            color: "var(--marquee-text, #ffd700)",
            textShadow: "var(--marquee-text-shadow, 0 0 10px rgba(255, 215, 0, 0.6))",
          }}
        >
          {teamName || "STANDUP SLOTS"}
        </h2>

        {/* Bottom row lights */}
        <div className="flex justify-center gap-3 mt-2 relative z-10">
          {[...Array(Math.ceil(lightCount / 2))].map((_, i) => (
            <div
              key={`b-${i}`}
              className="w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0
                  ? "var(--light-color-2, #ffd700)"
                  : "var(--light-color-1, #ff4444)",
                boxShadow: `0 0 6px ${i % 2 === 0 ? "var(--light-color-2, #ffd700)" : "var(--light-color-1, #ff4444)"}`,
                animation: `chase-light 1.5s ease-in-out infinite`,
                animationDelay: `${(i + 3) * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
