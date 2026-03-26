"use client";

interface MachineBaseProps {
  status: "idle" | "spinning" | "winner";
  poolEmpty: boolean;
  onNext: () => void;
  onReset: () => void;
  onNewSession: () => void;
}

export default function MachineBase({
  status,
  poolEmpty,
  onNext,
  onReset,
  onNewSession,
}: MachineBaseProps) {
  return (
    <div
      className="relative rounded-b-2xl px-4 sm:px-6 py-4"
      style={{
        background: "var(--base-bg, linear-gradient(180deg, #808080 0%, #606060 50%, #404040 100%))",
        boxShadow: "var(--base-shadow, inset 0 2px 0 rgba(255,255,255,0.15))",
      }}
    >
      {/* Payout tray shape */}
      <div
        className="mx-auto mb-3 rounded-b-lg"
        style={{
          height: "8px",
          width: "70%",
          background: "var(--base-tray, linear-gradient(180deg, #333 0%, #1a1a1a 100%))",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
          borderRadius: "0 0 8px 8px",
        }}
      />

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        {poolEmpty && status !== "winner" ? (
          <MachineButton
            label="NEW SESSION"
            variant="primary"
            onClick={onNewSession}
          />
        ) : status === "winner" ? (
          <>
            <MachineButton
              label="NEXT"
              variant="primary"
              onClick={onNext}
            />
            <MachineButton
              label="RESET"
              variant="secondary"
              onClick={onReset}
            />
          </>
        ) : (
          <div className="text-center py-2">
            <span
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "var(--machine-label-color, #888)" }}
            >
              {status === "spinning" ? "★ SPINNING ★" : "PULL TO SPIN"}
            </span>
          </div>
        )}
      </div>

      {/* Rivets */}
      <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full"
        style={{
          background: "var(--rivet-color, radial-gradient(circle at 35% 35%, #e0e0e0, #606060))",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.5)",
        }}
      />
      <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full"
        style={{
          background: "var(--rivet-color, radial-gradient(circle at 35% 35%, #e0e0e0, #606060))",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}

function MachineButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: "primary" | "secondary";
  onClick: () => void;
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      className="relative px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all active:translate-y-0.5"
      style={{
        background: isPrimary
          ? "var(--machine-button-primary, linear-gradient(180deg, #ff4444 0%, #cc0000 100%))"
          : "var(--machine-button-secondary, linear-gradient(180deg, #666 0%, #444 100%))",
        color: isPrimary
          ? "var(--machine-button-primary-text, #fff)"
          : "var(--machine-button-secondary-text, #ddd)",
        boxShadow: isPrimary
          ? "0 4px 0 var(--machine-button-primary-shadow, #880000), 0 6px 12px rgba(0,0,0,0.4)"
          : "0 4px 0 var(--machine-button-secondary-shadow, #222), 0 6px 12px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {label}
    </button>
  );
}
