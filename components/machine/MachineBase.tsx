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
    <div className="machine-base relative rounded-b-2xl px-4 sm:px-6 py-4">
      {/* Payout tray */}
      <div
        className="machine-base-tray mx-auto mb-3 rounded-b-lg"
        style={{
          height: "8px",
          width: "70%",
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
              label="CONFIRM & NEXT"
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
              style={{ color: "var(--machine-label-color)" }}
            >
              {status === "spinning" ? "★ SPINNING ★" : "PULL TO SPIN"}
            </span>
          </div>
        )}
      </div>

      {/* Rivets */}
      <div className="machine-rivet absolute bottom-3 left-3 w-3 h-3 rounded-full" />
      <div className="machine-rivet absolute bottom-3 right-3 w-3 h-3 rounded-full" />
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
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all active:translate-y-0.5 border border-white/10 ${
        variant === "primary" ? "machine-button-primary" : "machine-button-secondary"
      }`}
    >
      {label}
    </button>
  );
}
