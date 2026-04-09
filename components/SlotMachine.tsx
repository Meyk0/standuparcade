"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import MachineMarquee from "./machine/MachineMarquee";
import MachineBody from "./machine/MachineBody";
import MachineBase from "./machine/MachineBase";
import ReelWindow from "./machine/ReelWindow";
import PullHandle from "./machine/PullHandle";
import Confetti from "./Confetti";
import { Member } from "@/lib/types";
import { SKINS, SkinName } from "@/lib/skins";
import { playPullHandle, playSpinning, playWinnerFanfare } from "@/lib/sounds";
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
  onReset,
  onNewSession,
  onAnimationComplete,
}: SlotMachineProps) {
  const [winnerRevealed, setWinnerRevealed] = useState(status !== "spinning");
  const [soundOn, setSoundOn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  const skin = SKINS[skinName] || SKINS["classic-vegas"];

  const names = members.map((m) => m.name.toUpperCase());
  const winnerName = currentWinner?.name.toUpperCase() || "???";

  // Load sound preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("standup-slots-sound");
    if (saved === "on") setSoundOn(true);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem("standup-slots-sound", next ? "on" : "off");
      return next;
    });
  }, []);

  const handleAllReelsStopped = useCallback(() => {
    setWinnerRevealed(true);
    if (soundRef.current) playWinnerFanfare();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    onAnimationComplete();
  }, [onAnimationComplete]);

  const handleSpin = useCallback(() => {
    setWinnerRevealed(false);
    if (soundRef.current) {
      playPullHandle();
      setTimeout(() => { if (soundRef.current) playSpinning(); }, 250);
    }
    onSpin();
  }, [onSpin]);

  // Spacebar to pull the handle
  const isSpinning = status === "spinning";
  const isWinner = status === "winner";
  const handleDisabled = isSpinning || isWinner || poolEmpty;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      // Don't trigger if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      if (!handleDisabled) handleSpin();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDisabled, handleSpin]);

  return (
    <div className="relative flex items-start justify-center">
      <Confetti active={showConfetti} />

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
              {!isSpinning && currentWinner && winnerRevealed ? (
                <>
                  <div
                    className={`text-sm sm:text-base font-bold uppercase tracking-wider mb-0.5 ${isWinner ? "animate-winner-flash" : ""}`}
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
            onReset={onReset}
            onNewSession={onNewSession}
          />
        </div>

        {/* Sound toggle + home link */}
        <div className="flex items-center justify-between mt-3 px-1">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity"
            style={{ color: "var(--skin-text-secondary)" }}
          >
            ← HOME
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] uppercase tracking-wider hidden sm:inline"
              style={{ color: "var(--skin-text-secondary)" }}
            >
              SPACE TO SPIN
            </span>
            <button
              onClick={toggleSound}
              className="text-base hover:opacity-80 transition-opacity"
              title={soundOn ? "Mute sounds" : "Unmute sounds"}
              style={{ color: "var(--skin-text-secondary)" }}
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>
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
