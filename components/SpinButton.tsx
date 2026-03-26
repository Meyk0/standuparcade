"use client";

interface SpinButtonProps {
  status: "idle" | "spinning" | "winner";
  poolEmpty: boolean;
  onSpin: () => void;
  onNext: () => void;
  onReset: () => void;
  onNewSession: () => void;
}

export default function SpinButton({
  status,
  poolEmpty,
  onSpin,
  onNext,
  onReset,
  onNewSession,
}: SpinButtonProps) {
  if (poolEmpty && status !== "winner") {
    return (
      <div className="flex flex-col gap-3 items-center">
        <p className="text-skin-accent text-sm">ALL MEMBERS PICKED!</p>
        <button
          onClick={onNewSession}
          className="px-8 py-4 text-lg font-bold rounded-lg bg-skin-button-bg text-skin-button-text hover:bg-skin-button-hover transition-colors active:scale-95"
        >
          NEW SESSION
        </button>
      </div>
    );
  }

  if (status === "winner") {
    return (
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onNext}
          className="px-8 py-4 text-lg font-bold rounded-lg bg-skin-button-bg text-skin-button-text hover:bg-skin-button-hover transition-colors active:scale-95"
        >
          NEXT
        </button>
        <button
          onClick={onReset}
          className="px-6 py-4 text-lg font-bold rounded-lg border-2 border-skin-border text-skin-text hover:bg-skin-muted transition-colors active:scale-95"
        >
          RESET
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSpin}
      disabled={status === "spinning"}
      className={`px-12 py-5 text-xl font-bold rounded-lg transition-all active:scale-95 ${
        status === "spinning"
          ? "bg-skin-muted text-skin-text-secondary cursor-not-allowed animate-pulse"
          : "bg-skin-button-bg text-skin-button-text hover:bg-skin-button-hover shadow-lg hover:shadow-xl"
      }`}
    >
      {status === "spinning" ? "SPINNING..." : "SPIN"}
    </button>
  );
}
