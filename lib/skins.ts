export type SkinName = "arcade" | "synthwave" | "noir" | "harajuku" | "pub-quiz";

export interface SkinDefinition {
  name: SkinName;
  label: string;
  description: string;
  font: string;
  fontUrl: string;
}

export const SKINS: Record<SkinName, SkinDefinition> = {
  arcade: {
    name: "arcade",
    label: "Arcade",
    description: "CRT phosphor, Atari/Commodore",
    font: "'Press Start 2P', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
  },
  synthwave: {
    name: "synthwave",
    label: "Synthwave",
    description: "Outrun grid, Miami Vice",
    font: "'Orbitron', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap",
  },
  noir: {
    name: "noir",
    label: "Noir",
    description: "Film grain, detective thriller",
    font: "'Special Elite', cursive",
    fontUrl: "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap",
  },
  harajuku: {
    name: "harajuku",
    label: "Harajuku",
    description: "Pastel Tamagotchi, J-pop",
    font: "'Nunito', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap",
  },
  "pub-quiz": {
    name: "pub-quiz",
    label: "Pub Quiz",
    description: "Chalkboard, British pub",
    font: "'Patrick Hand', cursive",
    fontUrl: "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap",
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
