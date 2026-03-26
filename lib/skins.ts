export type SkinName = "arcade" | "synthwave" | "noir" | "harajuku" | "pub-quiz";

export interface SkinDefinition {
  name: SkinName;
  label: string;
  description: string;
  font: string;
  fontUrl: string;
  /** Path to a marquee/header image. Replaces the CSS marquee when set. */
  marqueeImage: string | null;
}

export const SKINS: Record<SkinName, SkinDefinition> = {
  arcade: {
    name: "arcade",
    label: "Arcade",
    description: "Classic 80s casino — chrome & gold",
    font: "'Press Start 2P', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    marqueeImage: "/machines/arcade-marquee.png",
  },
  synthwave: {
    name: "synthwave",
    label: "Synthwave",
    description: "Neon LED modern machine",
    font: "'Orbitron', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap",
    marqueeImage: null,
  },
  noir: {
    name: "noir",
    label: "Noir",
    description: "Old-school one-armed bandit",
    font: "'Special Elite', cursive",
    fontUrl: "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap",
    marqueeImage: null,
  },
  harajuku: {
    name: "harajuku",
    label: "Harajuku",
    description: "Kawaii pastel gachapon",
    font: "'Nunito', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap",
    marqueeImage: null,
  },
  "pub-quiz": {
    name: "pub-quiz",
    label: "Pub Quiz",
    description: "British pub fruit machine",
    font: "'Patrick Hand', cursive",
    fontUrl: "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap",
    marqueeImage: null,
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
