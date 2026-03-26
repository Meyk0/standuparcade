"use client";

import { useCallback, useState } from "react";
import MachineMarquee from "./machine/MachineMarquee";
import MachineBody from "./machine/MachineBody";
import MachineBase from "./machine/MachineBase";
import ReelWindow from "./machine/ReelWindow";
import PullHandle from "./machine/PullHandle";
import ImageMachineFrame from "./machine/ImageMachineFrame";
import { Member } from "@/lib/types";
import { SKINS, SkinName } from "@/lib/skins";
import Link from "next/link";

interface SlotMachineProps {
  teamName: string;
  skinName: SkinName;
  members: Member[];
  currentWinner: Member | null;
  status: "idle" | "spinning" | "winner";
  poolEmpty: boolean;
  total: number;
  remaining: number;
  onSpin: () => void;
  onNext: () => void;
  onReset: () => void;
  onNewSession: () => void;
  onAnimationComplete: () => void;
}

export default function SlotMachine({
  teamName,
  skinName,
  members,
  currentWinner,
  status,
  poolEmpty,
  total,
  remaining,
  onSpin,
  onNext,
  onReset,
  onNewSession,
  onAnimationComplete,
}: SlotMachineProps) {
  const [winnerRevealed, setWinnerRevealed] = useState(false);

  const skin = SKINS[skinName] || SKINS.arcade;
  const useImageFrame = !!skin.frameImage;

  const names = members.map((m) => m.name.toUpperCase());
  const winnerName = currentWinner?.name.toUpperCase() || "???";

  const handleAllReelsStopped = useCallback(() => {
    setWinnerRevealed(true);
    onAnimationComplete();
  }, [onAnimationComplete]);

  const handleSpin = useCallback(() => {
    setWinnerRevealed(false);
    onSpin();
  }, [onSpin]);

  const handleNext = useCallback(() => {
    setWinnerRevealed(false);
    onNext();
  }, [onNext]);

  const isSpinning = status === "spinning";
  const isWinner = status === "winner";
  const handleDisabled = isSpinning || isWinner || poolEmpty;

  // Reel content — fillContainer mode for image frames
  const makeReelContent = (fill: boolean) => (
    <ReelWindow
      names={names.length > 0 ? names : ["???"]}
      winnerName={winnerName}
      status={status}
      onAllReelsStopped={handleAllReelsStopped}
      fillContainer={fill}
    />
  );

  // Shared winner announcement
  const winnerContent = (
    <div className="text-center w-full">
      {isWinner && currentWinner && winnerRevealed ? (
        <>
          <div
            className="text-sm sm:text-base font-bold uppercase tracking-wider animate-winner-flash"
            style={{
              color: "var(--skin-accent)",
              textShadow: "0 0 10px var(--skin-accent)",
            }}
          >
            {currentWinner.name} — YOU&apos;RE UP!
          </div>
          {currentWinner.tagline && (
            <span
              className="text-xs italic"
              style={{ color: "var(--reel-text)" }}
            >
              {currentWinner.tagline}
            </span>
          )}
        </>
      ) : (
        <span
          className="text-[10px] uppercase tracking-[0.15em]"
          style={{ color: "var(--machine-label-color)" }}
        >
          {isSpinning ? "" : poolEmpty ? "ALL PICKED" : "\u00A0"}
        </span>
      )}
    </div>
  );

  // Shared button content
  const buttonContent = (
    <MachineBase
      status={poolEmpty && status !== "winner" ? "idle" : status}
      poolEmpty={poolEmpty}
      onNext={handleNext}
      onReset={onReset}
      onNewSession={onNewSession}
    />
  );

  // Shared credits display
  const creditsContent = (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[...Array(Math.min(total, 12))].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: i < remaining ? "var(--light-color-2)" : "var(--machine-label-color)",
              boxShadow: i < remaining ? "0 0 3px var(--light-color-2)" : "none",
              opacity: i < remaining ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <span className="text-[9px] font-bold" style={{ color: "var(--marquee-text)" }}>
        {remaining}
      </span>
    </div>
  );

  return (
    <div className="flex items-start justify-center gap-0">
      <div
        className="relative w-full max-w-[420px]"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }}
      >
        {useImageFrame ? (
          /* ==========================================
             IMAGE-BASED FRAME
             Machine frame is a photorealistic image
             with interactive elements overlaid
             ========================================== */
          <ImageMachineFrame
            skin={skin}
            reelContent={makeReelContent(true)}
            winnerContent={winnerContent}
            buttonContent={buttonContent}
            creditsContent={creditsContent}
          />
        ) : (
          /* ==========================================
             CSS-BASED FRAME (default)
             Machine built entirely from CSS gradients,
             shadows, and styled components
             ========================================== */
          <div className="machine-frame rounded-2xl overflow-hidden">
            <MachineMarquee teamName={teamName} isSpinning={isSpinning} />

            <MachineBody total={total} remaining={remaining}>
              {makeReelContent(false)}
            </MachineBody>

            {/* Winner area — fixed height to prevent layout shift */}
            <div className="machine-winner-area" style={{ minHeight: "52px" }}>
              {winnerContent}
            </div>

            {buttonContent}
          </div>
        )}

        {/* Home link */}
        <div className="text-center mt-3">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity"
            style={{ color: "var(--skin-text-secondary)" }}
          >
            ← HOME
          </Link>
        </div>
      </div>

      {/* Pull handle (right side, desktop only) */}
      <div className="hidden sm:flex items-center pt-20">
        <PullHandle disabled={handleDisabled} onPull={handleSpin} />
      </div>

      {/* Mobile pull button */}
      <button
        onClick={handleSpin}
        disabled={handleDisabled}
        className="sm:hidden fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full font-bold text-xs uppercase tracking-wider transition-all active:scale-90 disabled:opacity-40"
        style={{
          background: "var(--handle-ball)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
          color: "#fff",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        PULL
      </button>
    </div>
  );
}
