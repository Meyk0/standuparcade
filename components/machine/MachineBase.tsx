"use client";

interface MachineBaseProps {
  status: "idle" | "spinning" | "winner";
  poolEmpty: boolean;
  onReset: () => void;
  onNewSession: () => void;
}

export default function MachineBase({
  status,
  poolEmpty,
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

      {/* Action area */}
      <div className="flex justify-center gap-3">
        {poolEmpty && status === "idle" ? (
          <MachineButton
            label="NEW SESSION"
            variant="primary"
            onClick={onNewSession}
          />
        ) : (
          <div className="text-center py-2 flex items-center gap-3">
            <span
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "var(--machine-label-color)" }}
            >
              {status === "spinning"
                ? "★ SPINNING ★"
                : status === "winner"
                  ? "★ WINNER ★"
                  : "PULL TO SPIN"}
            </span>
            {status === "idle" && !poolEmpty && (
              <button
                onClick={onReset}
                className="text-[9px] uppercase tracking-wider px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                style={{
                  color: "var(--machine-label-color)",
                  border: "1px solid var(--machine-label-color)",
                }}
              >
                RESET
              </button>
            )}
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
