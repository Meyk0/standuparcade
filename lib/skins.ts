export type SkinName = "arcade" | "synthwave" | "noir" | "harajuku" | "pub-quiz";

/**
 * Reel window position within the machine frame image.
 * All values are percentages of the image dimensions.
 * This allows the reels to be positioned precisely over
 * the transparent/reel area of the machine frame image.
 */
export interface ReelWindowPosition {
  top: number;    // % from top
  left: number;   // % from left
  width: number;  // % of image width
  height: number; // % of image height
}

/**
 * Button/handle positions within the machine frame image.
 * Percentages of the image dimensions.
 */
export interface MachineOverlayPositions {
  /** Where the reel window sits within the frame image */
  reelWindow: ReelWindowPosition;
  /** Where the "winner text" announcement shows */
  winnerText: { top: number; left: number; width: number };
  /** Where action buttons (NEXT/RESET) render */
  buttons: { top: number; left: number; width: number };
  /** Where the handle sits (right side) — null = use CSS handle */
  handle: { top: number; right: number } | null;
}

export interface SkinDefinition {
  name: SkinName;
  label: string;
  description: string;
  font: string;
  fontUrl: string;
  /** Path to machine frame image, relative to /public. Null = use CSS machine. */
  frameImage: string | null;
  /** Aspect ratio of the frame image (width / height). Used to maintain proportions. */
  frameAspectRatio: number;
  /** Positions of interactive elements over the frame image */
  overlayPositions: MachineOverlayPositions;
}

/**
 * Default overlay positions matching our standard frame template.
 * All images should be generated at 800x1200 (2:3 ratio).
 *
 * The standard layout is:
 * - Marquee/sign: top 0-15%
 * - Reel window: 20-52% from top, centered horizontally
 * - Winner text: 54-62%
 * - Buttons: 65-75%
 * - Base/tray: 75-100%
 */
const DEFAULT_OVERLAY: MachineOverlayPositions = {
  reelWindow: { top: 20, left: 10, width: 80, height: 32 },
  winnerText: { top: 54, left: 10, width: 80 },
  buttons: { top: 65, left: 15, width: 70 },
  handle: null, // Use CSS handle by default
};

export const SKINS: Record<SkinName, SkinDefinition> = {
  arcade: {
    name: "arcade",
    label: "Arcade",
    description: "Classic 80s casino — chrome & gold",
    font: "'Press Start 2P', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    frameImage: "/machines/arcade.png",
    frameAspectRatio: 805 / 1200,
    overlayPositions: {
      reelWindow: { top: 38, left: 18, width: 64, height: 13 },
      winnerText: { top: 52, left: 15, width: 70 },
      buttons: { top: 56, left: 20, width: 60 },
      handle: null,
    },
  },
  synthwave: {
    name: "synthwave",
    label: "Synthwave",
    description: "Neon LED modern machine",
    font: "'Orbitron', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap",
    frameImage: null,
    frameAspectRatio: 2 / 3,
    overlayPositions: DEFAULT_OVERLAY,
  },
  noir: {
    name: "noir",
    label: "Noir",
    description: "Old-school one-armed bandit",
    font: "'Special Elite', cursive",
    fontUrl: "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap",
    frameImage: null,
    frameAspectRatio: 2 / 3,
    overlayPositions: DEFAULT_OVERLAY,
  },
  harajuku: {
    name: "harajuku",
    label: "Harajuku",
    description: "Kawaii pastel gachapon",
    font: "'Nunito', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap",
    frameImage: null,
    frameAspectRatio: 2 / 3,
    overlayPositions: DEFAULT_OVERLAY,
  },
  "pub-quiz": {
    name: "pub-quiz",
    label: "Pub Quiz",
    description: "British pub fruit machine",
    font: "'Patrick Hand', cursive",
    fontUrl: "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap",
    frameImage: null,
    frameAspectRatio: 2 / 3,
    overlayPositions: DEFAULT_OVERLAY,
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
