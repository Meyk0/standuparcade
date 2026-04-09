"use client";

// Web Audio API sound effects — no audio files needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function playPullHandle() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Mechanical clunk
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);

  // Spring boing
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(200, now + 0.08);
  osc2.frequency.exponentialRampToValueAtTime(600, now + 0.2);
  osc2.frequency.exponentialRampToValueAtTime(150, now + 0.35);
  gain2.gain.setValueAtTime(0.15, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.35);
}

export function playSpinning() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const duration = 2.5;

  // Ticking reel sound
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate clicking pattern that slows down
  const clicksPerSecond = 30;
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const rate = clicksPerSecond * Math.max(0.2, 1 - t / duration);
    const phase = (t * rate) % 1;
    data[i] = phase < 0.02 ? (Math.random() * 2 - 1) * 0.2 : 0;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0.05, now + duration);
  source.connect(gain).connect(ctx.destination);
  source.start(now);
}

export function playReelStop() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Thunk sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

export function playWinnerFanfare() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Ascending arpeggio — C E G C'
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const t = now + i * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.setValueAtTime(0.15, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });

  // Final shimmer
  const shimmerTime = now + notes.length * 0.12;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5 + i * 200, shimmerTime);
    gain.gain.setValueAtTime(0.08, shimmerTime);
    gain.gain.exponentialRampToValueAtTime(0.001, shimmerTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(shimmerTime);
    osc.stop(shimmerTime + 0.5);
  }
}
