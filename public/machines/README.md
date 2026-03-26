# Slot Machine Frame Images

Drop your machine frame images here. Each skin can have its own photorealistic frame image.

## Image Specifications

**Size:** 800 x 1200 pixels (2:3 aspect ratio)
**Format:** PNG with transparency (recommended) or solid dark background in the reel area
**Orientation:** Front-facing, perfectly centered, no perspective/angle

## Layout Template

The image should follow this vertical layout:

```
┌──────────────────────────┐ 0%
│                          │
│       MARQUEE/SIGN       │
│    (team name area)      │
│                          │ 15%
├──────────────────────────┤ 20%
│                          │
│                          │
│      REEL WINDOW         │
│   (dark/transparent)     │
│    Names render here     │
│                          │
│                          │
├──────────────────────────┤ 52%
│   Winner announcement    │ 54-62%
├──────────────────────────┤
│                          │
│    Button area           │ 65-73%
│                          │
├──────────────────────────┤
│                          │
│    BASE / PAYOUT TRAY    │
│                          │
└──────────────────────────┘ 100%
```

## Critical: The Reel Window Area

The reel window area (20-52% from top, centered) should be either:
1. **Transparent** (best) — the animated names render directly through it
2. **Solid dark color** (#0a0a0a) — the names render on top

The rest of the image is the decorative frame (chrome, wood, neon, etc.)

## File Naming

- `arcade.png` — Classic 80s casino chrome machine
- `synthwave.png` — Neon LED modern machine
- `noir.png` — Old brass one-armed bandit
- `harajuku.png` — Pastel kawaii gachapon
- `pub-quiz.png` — British pub fruit machine

## Activating a Frame

After dropping an image, edit `lib/skins.ts` and set the `frameImage` field:

```ts
arcade: {
  ...
  frameImage: "/machines/arcade.png", // was null
  ...
}
```

If the reel window position doesn't align perfectly, adjust `overlayPositions.reelWindow`:

```ts
overlayPositions: {
  reelWindow: { top: 22, left: 12, width: 76, height: 30 },
  // top/left/width/height are percentages of the image
}
```
