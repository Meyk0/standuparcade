"use client";

import { ReactNode } from "react";
import { SkinDefinition } from "@/lib/skins";

interface ImageMachineFrameProps {
  skin: SkinDefinition;
  reelContent: ReactNode;
  winnerContent: ReactNode;
  buttonContent: ReactNode;
  creditsContent: ReactNode;
}

export default function ImageMachineFrame({
  skin,
  reelContent,
  winnerContent,
  buttonContent,
  creditsContent,
}: ImageMachineFrameProps) {
  const { frameImage, overlayPositions } = skin;
  const { reelWindow, winnerText, buttons } = overlayPositions;

  if (!frameImage) return null;

  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* Machine frame image — drives the container size */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frameImage}
        alt={`${skin.label} slot machine`}
        className="w-full h-auto block pointer-events-none select-none"
        draggable={false}
      />

      {/* Reel window overlay — positioned over the reel area in the image */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: `${reelWindow.top}%`,
          left: `${reelWindow.left}%`,
          width: `${reelWindow.width}%`,
          height: `${reelWindow.height}%`,
        }}
      >
        {reelContent}
      </div>

      {/* Credits display — on the nameplate area above the reels */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: `${reelWindow.top - 6}%`,
          left: `${reelWindow.left + 5}%`,
          width: `${reelWindow.width - 10}%`,
          height: "4%",
        }}
      >
        {creditsContent}
      </div>

      {/* Winner announcement — below the reel window */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: `${winnerText.top}%`,
          left: `${winnerText.left}%`,
          width: `${winnerText.width}%`,
          height: "7%",
        }}
      >
        {winnerContent}
      </div>

      {/* Action buttons — below winner text */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: `${buttons.top}%`,
          left: `${buttons.left}%`,
          width: `${buttons.width}%`,
          height: "7%",
        }}
      >
        {buttonContent}
      </div>
    </div>
  );
}
