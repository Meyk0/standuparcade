"use client";

interface MachineMarqueeProps {
  teamName: string;
  isSpinning: boolean;
  marqueeImage?: string | null;
}

export default function MachineMarquee({ teamName, isSpinning, marqueeImage }: MachineMarqueeProps) {
  // Image-based marquee — fill width, crop to fit
  if (marqueeImage) {
    return (
      <div
        className="relative overflow-hidden rounded-t-2xl"
        style={{
          height: "160px",
          background: "#0a0808",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={marqueeImage}
          alt={teamName || "Standup Slots"}
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
      </div>
    );
  }

  // CSS-based marquee (fallback)
  const lightCount = 12;

  return (
    <div className="relative">
      <div className="machine-marquee relative rounded-t-2xl px-4 py-3 text-center overflow-hidden">
        {/* Chase lights — sides */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <div className="flex flex-col gap-2 py-1">
            {[...Array(Math.ceil(lightCount / 4))].map((_, i) => (
              <div
                key={`l-${i}`}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "var(--marquee-light-color)",
                  boxShadow: `0 0 6px var(--marquee-light-color)`,
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
                  background: "var(--marquee-light-color)",
                  boxShadow: `0 0 6px var(--marquee-light-color)`,
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
                background: i % 2 === 0 ? "var(--light-color-1)" : "var(--light-color-2)",
                boxShadow: `0 0 6px ${i % 2 === 0 ? "var(--light-color-1)" : "var(--light-color-2)"}`,
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
            color: "var(--marquee-text)",
            textShadow: "var(--marquee-text-shadow)",
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
                background: i % 2 === 0 ? "var(--light-color-2)" : "var(--light-color-1)",
                boxShadow: `0 0 6px ${i % 2 === 0 ? "var(--light-color-2)" : "var(--light-color-1)"}`,
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
