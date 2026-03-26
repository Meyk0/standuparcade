"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { SkinDefinition } from "@/lib/skins";

interface ImageMachineFrameProps {
  skin: SkinDefinition;
  reelContent: ReactNode;
  winnerContent: ReactNode;
  buttonContent: ReactNode;
  creditsContent: ReactNode;
}

/**
 * Renders a photorealistic machine frame image with interactive
 * elements (reels, buttons, winner text) positioned over it.
 *
 * The frame image should be an 800x1200 PNG with the reel area
 * either transparent or a solid dark color that the reels render over.
 */
export default function ImageMachineFrame({
  skin,
  reelContent,
  winnerContent,
  buttonContent,
  creditsContent,
}: ImageMachineFrameProps) {
  const { frameImage, frameAspectRatio, overlayPositions } = skin;
  const { reelWindow, winnerText, buttons } = overlayPositions;

  if (!frameImage) return null;

  return (
    <div
      className="relative w-full max-w-[420px] mx-auto"
      style={{
        aspectRatio: `${frameAspectRatio}`,
      }}
    >
      {/* Machine frame image */}
      <Image
        src={frameImage}
        alt={`${skin.label} slot machine`}
        fill
        className="object-contain pointer-events-none select-none"
        priority
        sizes="420px"
      />

      {/* Reel window overlay — positioned exactly over the reel area in the image */}
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

      {/* Credits display — just above the reel window */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: `${reelWindow.top - 5}%`,
          left: `${reelWindow.left}%`,
          width: `${reelWindow.width}%`,
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
          height: "8%",
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
          height: "8%",
        }}
      >
        {buttonContent}
      </div>
    </div>
  );
}
