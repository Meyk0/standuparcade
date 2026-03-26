"use client";

interface CoinRowProps {
  total: number;
  remaining: number;
}

export default function CoinRow({ total, remaining }: CoinRowProps) {
  return (
    <div className="flex gap-1.5 justify-center flex-wrap">
      {[...Array(total)].map((_, i) => {
        const isUsed = i >= remaining;
        return (
          <div
            key={i}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
              isUsed
                ? "border-skin-muted bg-skin-muted text-skin-text-secondary opacity-40"
                : "border-skin-accent bg-skin-accent text-skin-button-text"
            }`}
          >
            ●
          </div>
        );
      })}
    </div>
  );
}
