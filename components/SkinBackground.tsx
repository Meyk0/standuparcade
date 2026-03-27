"use client";

import { SkinName, SKINS } from "@/lib/skins";

interface SkinBackgroundProps {
  skinName: SkinName;
}

/**
 * Per-skin background image for the game page.
 * Falls back to the skin's CSS --skin-bg color if no image is set.
 */
export default function SkinBackground({ skinName }: SkinBackgroundProps) {
  const skin = SKINS[skinName] || SKINS["classic-vegas"];

  if (!skin.bgDesktop && !skin.bgMobile) return null;

  return (
    <>
      {skin.bgDesktop && (
        <div
          className="fixed inset-0 hidden md:block bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url('${skin.bgDesktop}')` }}
        />
      )}
      {skin.bgMobile && (
        <div
          className="fixed inset-0 md:hidden bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url('${skin.bgMobile}')` }}
        />
      )}
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/40 -z-10" />
    </>
  );
}
