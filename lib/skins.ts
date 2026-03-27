export type SkinName = "classic-vegas" | "lucky-dragon" | "pharaoh" | "retro-arcade" | "fruit-machine";

export interface SkinDefinition {
  name: SkinName;
  label: string;
  description: string;
  font: string;
  fontUrl: string;
  /** Path to a marquee/header image. Replaces the CSS marquee when set. */
  marqueeImage: string | null;
  /** Background images for the game page. Null = use solid --skin-bg color. */
  bgDesktop: string | null;
  bgMobile: string | null;
}

export const SKINS: Record<SkinName, SkinDefinition> = {
  "classic-vegas": {
    name: "classic-vegas",
    label: "Classic Vegas",
    description: "Chrome & gold casino classic",
    font: "'Press Start 2P', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    marqueeImage: "/machines/classic-vegas-marquee.png",
    bgDesktop: "/bg-desktop.jpg",
    bgMobile: "/bg-mobile.jpg",
  },
  "lucky-dragon": {
    name: "lucky-dragon",
    label: "Lucky Dragon",
    description: "Macau casino — red, gold & jade",
    font: "'Orbitron', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap",
    marqueeImage: "/machines/lucky-dragon-marquee.png",
    bgDesktop: null, // Set to "/bg/lucky-dragon-desktop.jpg" when ready
    bgMobile: null,
  },
  pharaoh: {
    name: "pharaoh",
    label: "Pharaoh's Fortune",
    description: "Egyptian temple slot machine",
    font: "'Cinzel', serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap",
    marqueeImage: "/machines/pharaoh-marquee.png",
    bgDesktop: null,
    bgMobile: null,
  },
  "retro-arcade": {
    name: "retro-arcade",
    label: "Retro Arcade",
    description: "80s arcade cabinet — CRT & pixels",
    font: "'Press Start 2P', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    marqueeImage: "/machines/retro-arcade-marquee.png",
    bgDesktop: null,
    bgMobile: null,
  },
  "fruit-machine": {
    name: "fruit-machine",
    label: "Fruit Machine",
    description: "British pub fruit machine",
    font: "'Patrick Hand', cursive",
    fontUrl: "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap",
    marqueeImage: "/machines/fruit-machine-marquee.png",
    bgDesktop: null,
    bgMobile: null,
  },
};

export const SKIN_NAMES = Object.keys(SKINS) as SkinName[];

export const DEFAULT_TAGLINES = [
  "READY TO ROLL",
  "LET'S GO",
  "ON DECK",
  "GAME ON",
  "LOCKED IN",
  "FULL SEND",
  "DIALED IN",
  "NO MERCY",
  "BEAST MODE",
  "CLUTCH TIME",
];

export function getRandomTagline(): string {
  return DEFAULT_TAGLINES[Math.floor(Math.random() * DEFAULT_TAGLINES.length)];
}
