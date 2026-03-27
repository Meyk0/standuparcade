"use client";

import { ReactNode } from "react";

interface CasinoBackgroundProps {
  children: ReactNode;
}

/**
 * Full-page casino background with responsive desktop/mobile images.
 * Used on landing page and settings page.
 */
export default function CasinoBackground({ children }: CasinoBackgroundProps) {
  return (
    <div className="relative min-h-screen">
      {/* Background image — desktop */}
      <div
        className="fixed inset-0 hidden md:block bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-desktop.jpg')" }}
      />
      {/* Background image — mobile */}
      <div
        className="fixed inset-0 md:hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-mobile.jpg')" }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-black/50" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
