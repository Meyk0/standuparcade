"use client";

import { useCallback, useState } from "react";
import MachineMarquee from "./machine/MachineMarquee";
import MachineBody from "./machine/MachineBody";
import MachineBase from "./machine/MachineBase";
import ReelWindow from "./machine/ReelWindow";
import PullHandle from "./machine/PullHandle";
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

  return (
    <div className="relative flex items-start justify-center">
      {/* Machine container */}
      <div className="relative w-full max-w-[420px]">
        {/* Marquee — sits above the machine body, full width */}
        <MachineMarquee
          teamName={teamName}
          isSpinning={isSpinning}
          marqueeImage={skin.marqueeImage}
        />

        {/* Machine body */}
        <div className="machine-frame rounded-b-2xl overflow-hidden">
          {/* Body with reels */}
          <MachineBody total={total} remaining={remaining}>
            <ReelWindow
              names={names.length > 0 ? names : ["???"]}
              winnerName={winnerName}
              status={status}
              onAllReelsStopped={handleAllReelsStopped}
            />
          </MachineBody>

          {/* Winner area — fixed height */}
          <div className="machine-winner-area" style={{ minHeight: "52px" }}>
            <div className="text-center w-full py-2 px-4">
              {isWinner && currentWinner && winnerRevealed ? (
                <>
                  <div
                    className="text-sm sm:text-base font-bold uppercase tracking-wider animate-winner-flash mb-0.5"
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
          </div>

          {/* Base with buttons */}
          <MachineBase
            status={poolEmpty && status !== "winner" ? "idle" : status}
            poolEmpty={poolEmpty}
            onNext={handleNext}
            onReset={onReset}
            onNewSession={onNewSession}
          />
        </div>

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

      {/* Pull handle (desktop) — outside the machine container so filter can't clip it */}
      <div
        className="hidden sm:block flex-shrink-0"
        style={{ marginTop: "140px" }}
      >
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
