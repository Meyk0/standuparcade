export type VoiceStyle =
  | "classic-host"
  | "arcade-robot"
  | "hype-announcer"
  | "calm-narrator";

export type VoiceIntensity = "clean" | "amped" | "extreme";

export type AnnouncerPack =
  | "classic-game-show"
  | "retro-cabinet"
  | "arena-hype"
  | "calm-facilitator";

export type FixedAnnouncementTemplate =
  | "youre-up"
  | "next-player"
  | "player-one"
  | "jackpot"
  | "spotlight"
  | "bonus-round"
  | "high-score"
  | "boss-level"
  | "level-up"
  | "insert-coin";

export type AnnouncementTemplate = "surprise" | FixedAnnouncementTemplate;

export interface VoiceAnnouncementSettings {
  enabled: boolean;
  style: VoiceStyle;
  intensity: VoiceIntensity;
  template: AnnouncementTemplate;
}

interface VoiceStyleDefinition {
  label: string;
  description: string;
  rate: number;
  pitch: number;
}

interface VoiceIntensityDefinition {
  label: string;
  description: string;
}

interface AnnouncerPackDefinition {
  label: string;
  description: string;
  settings: Pick<
    VoiceAnnouncementSettings,
    "style" | "intensity" | "template"
  >;
}

interface AnnouncementTemplateDefinition {
  label: string;
  text: string;
}

interface AudioEffectConfig {
  playbackRate: number;
  gain: number;
  highpass?: number;
  lowpass?: number;
  bandpass?: { frequency: number; q: number };
  lowshelf?: { frequency: number; gain: number };
  highshelf?: { frequency: number; gain: number };
  distortion?: number;
  compressor?: {
    threshold: number;
    knee: number;
    ratio: number;
    attack: number;
    release: number;
  };
  echo?: {
    delay: number;
    feedback: number;
    wet: number;
  };
}

type AudioWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export const VOICE_ANNOUNCEMENT_STORAGE_KEY =
  "standup-slots-voice-announcements";

export const DEFAULT_VOICE_SETTINGS: VoiceAnnouncementSettings = {
  enabled: true,
  style: "classic-host",
  intensity: "amped",
  template: "surprise",
};

export const VOICE_STYLES: Record<VoiceStyle, VoiceStyleDefinition> = {
  "classic-host": {
    label: "Classic Host",
    description: "Bright game-show host",
    rate: 0.95,
    pitch: 1,
  },
  "arcade-robot": {
    label: "Arcade Robot",
    description: "Filtered cabinet voice",
    rate: 0.82,
    pitch: 0.65,
  },
  "hype-announcer": {
    label: "Hype Announcer",
    description: "Arena entrance energy",
    rate: 1.08,
    pitch: 1.25,
  },
  "calm-narrator": {
    label: "Calm Narrator",
    description: "Warm standup flow",
    rate: 0.9,
    pitch: 0.9,
  },
};

export const VOICE_INTENSITIES: Record<
  VoiceIntensity,
  VoiceIntensityDefinition
> = {
  clean: {
    label: "Clean",
    description: "Readable",
  },
  amped: {
    label: "Amped",
    description: "Stylized",
  },
  extreme: {
    label: "Extreme",
    description: "Maximum",
  },
};

export const ANNOUNCER_PACKS: Record<AnnouncerPack, AnnouncerPackDefinition> = {
  "classic-game-show": {
    label: "Game Show",
    description: "Bright host, polished pacing",
    settings: {
      style: "classic-host",
      intensity: "amped",
      template: "surprise",
    },
  },
  "retro-cabinet": {
    label: "Arcade Cabinet",
    description: "Robot voice, heavy effects",
    settings: {
      style: "arcade-robot",
      intensity: "extreme",
      template: "surprise",
    },
  },
  "arena-hype": {
    label: "Arena Hype",
    description: "Big reveal, high energy",
    settings: {
      style: "hype-announcer",
      intensity: "extreme",
      template: "jackpot",
    },
  },
  "calm-facilitator": {
    label: "Facilitator",
    description: "Warm and meeting-friendly",
    settings: {
      style: "calm-narrator",
      intensity: "clean",
      template: "next-player",
    },
  },
};

export function applyAnnouncerPack(
  settings: VoiceAnnouncementSettings,
  pack: AnnouncerPack
): VoiceAnnouncementSettings {
  return {
    ...settings,
    ...ANNOUNCER_PACKS[pack].settings,
    enabled: true,
  };
}

export const ANNOUNCEMENT_TEMPLATES: Record<
  AnnouncementTemplate,
  AnnouncementTemplateDefinition
> = {
  surprise: {
    label: "Surprise Mix",
    text: "Changes by winner",
  },
  "youre-up": {
    label: "You're Up",
    text: "{name}, you're up!",
  },
  "next-player": {
    label: "Next Player",
    text: "Next player: {name}.",
  },
  "player-one": {
    label: "Player One",
    text: "Player one: {name}.",
  },
  jackpot: {
    label: "Jackpot",
    text: "Jackpot! {name}, you're up.",
  },
  spotlight: {
    label: "Spotlight",
    text: "The spotlight is on {name}.",
  },
  "bonus-round": {
    label: "Bonus Round",
    text: "Bonus round! {name}, take the stage.",
  },
  "high-score": {
    label: "High Score",
    text: "New high score: {name}!",
  },
  "boss-level": {
    label: "Boss Level",
    text: "Boss level unlocked: {name}.",
  },
  "level-up": {
    label: "Level Up",
    text: "{name} levels up next.",
  },
  "insert-coin": {
    label: "Insert Coin",
    text: "Insert coin for {name}.",
  },
};

const SURPRISE_TEMPLATE_POOL: FixedAnnouncementTemplate[] = [
  "youre-up",
  "next-player",
  "player-one",
  "jackpot",
  "spotlight",
  "bonus-round",
  "high-score",
  "boss-level",
  "level-up",
  "insert-coin",
];

let activeAudio: HTMLAudioElement | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeContext: AudioContext | null = null;
let activeCleanup: (() => void) | null = null;

function isVoiceStyle(value: unknown): value is VoiceStyle {
  return typeof value === "string" && value in VOICE_STYLES;
}

function isVoiceIntensity(value: unknown): value is VoiceIntensity {
  return typeof value === "string" && value in VOICE_INTENSITIES;
}

function isAnnouncementTemplate(value: unknown): value is AnnouncementTemplate {
  return typeof value === "string" && value in ANNOUNCEMENT_TEMPLATES;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const audioWindow = window as AudioWindow;
  return audioWindow.AudioContext || audioWindow.webkitAudioContext || null;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getStoredVoiceSettings(): VoiceAnnouncementSettings {
  if (typeof window === "undefined") return DEFAULT_VOICE_SETTINGS;

  try {
    const raw = window.localStorage.getItem(VOICE_ANNOUNCEMENT_STORAGE_KEY);
    if (!raw) return DEFAULT_VOICE_SETTINGS;

    const parsed = JSON.parse(raw);
    if (!isObject(parsed)) return DEFAULT_VOICE_SETTINGS;

    const storedIntensity = isVoiceIntensity(parsed.intensity)
      ? parsed.intensity
      : undefined;

    return {
      enabled: DEFAULT_VOICE_SETTINGS.enabled,
      style: isVoiceStyle(parsed.style)
        ? parsed.style
        : DEFAULT_VOICE_SETTINGS.style,
      intensity: storedIntensity ?? DEFAULT_VOICE_SETTINGS.intensity,
      template: storedIntensity && isAnnouncementTemplate(parsed.template)
        ? parsed.template
        : DEFAULT_VOICE_SETTINGS.template,
    };
  } catch {
    return DEFAULT_VOICE_SETTINGS;
  }
}

export function saveVoiceSettings(settings: VoiceAnnouncementSettings) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      VOICE_ANNOUNCEMENT_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Local storage can be unavailable in private or restricted contexts.
  }
}

export function resolveAnnouncementTemplate(
  name: string,
  template: AnnouncementTemplate
): FixedAnnouncementTemplate {
  if (template !== "surprise") return template;

  const normalizedName = name.trim().toLowerCase();
  const hash = hashString(normalizedName || name);
  return SURPRISE_TEMPLATE_POOL[hash % SURPRISE_TEMPLATE_POOL.length];
}

export function buildAnnouncement(
  name: string,
  template: AnnouncementTemplate
): string {
  const resolvedTemplate = resolveAnnouncementTemplate(name, template);
  return ANNOUNCEMENT_TEMPLATES[resolvedTemplate].text.replace("{name}", name);
}

export function supportsSpeechSynthesis(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

export function supportsVoiceAnnouncements(): boolean {
  return (
    typeof window !== "undefined" &&
    ("Audio" in window || getAudioContextConstructor() !== null)
  );
}

function stopCurrentAnnouncement() {
  if (typeof window === "undefined") return;

  if (supportsSpeechSynthesis()) {
    window.speechSynthesis.cancel();
  }

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }

  if (activeSource) {
    try {
      activeSource.stop();
    } catch {
      // The source may have already ended.
    }
    activeSource.disconnect();
    activeSource = null;
  }

  if (activeCleanup) {
    const cleanup = activeCleanup;
    activeCleanup = null;
    cleanup();
  } else if (activeContext) {
    void activeContext.close().catch(() => {});
    activeContext = null;
  }
}

function getFallbackSpeechSettings(settings: VoiceAnnouncementSettings) {
  const style = VOICE_STYLES[settings.style];
  const intensity = settings.intensity;

  if (settings.style === "arcade-robot") {
    return {
      rate: intensity === "extreme" ? 0.7 : intensity === "amped" ? 0.78 : 0.86,
      pitch: intensity === "extreme" ? 0.45 : intensity === "amped" ? 0.55 : 0.7,
    };
  }

  if (settings.style === "hype-announcer") {
    return {
      rate: intensity === "extreme" ? 1.18 : intensity === "amped" ? 1.12 : 1.04,
      pitch: intensity === "extreme" ? 1.45 : intensity === "amped" ? 1.32 : 1.15,
    };
  }

  if (settings.style === "calm-narrator") {
    return {
      rate: intensity === "extreme" ? 0.82 : intensity === "amped" ? 0.88 : 0.92,
      pitch: intensity === "extreme" ? 0.82 : intensity === "amped" ? 0.88 : 0.94,
    };
  }

  return {
    rate: intensity === "extreme" ? 1.04 : intensity === "amped" ? 0.98 : style.rate,
    pitch: intensity === "extreme" ? 1.14 : intensity === "amped" ? 1.06 : style.pitch,
  };
}

function speakText(text: string, settings: VoiceAnnouncementSettings): boolean {
  if (!supportsSpeechSynthesis()) return false;

  const speechSettings = getFallbackSpeechSettings(settings);
  stopCurrentAnnouncement();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = speechSettings.rate;
  utterance.pitch = speechSettings.pitch;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
  return true;
}

function createDistortionCurve(amount: number) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let index = 0; index < samples; index++) {
    const x = (index * 2) / samples - 1;
    curve[index] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

function connectBiquad(
  audioContext: AudioContext,
  current: AudioNode,
  type: BiquadFilterType,
  frequency: number,
  q?: number,
  gain?: number
) {
  const filter = audioContext.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  if (typeof q === "number") filter.Q.value = q;
  if (typeof gain === "number") filter.gain.value = gain;
  current.connect(filter);
  return filter;
}

function getAudioEffectConfig(settings: VoiceAnnouncementSettings): AudioEffectConfig {
  const intensity = settings.intensity;

  if (settings.style === "arcade-robot") {
    if (intensity === "extreme") {
      return {
        playbackRate: 0.78,
        gain: 1.18,
        highpass: 170,
        lowpass: 3100,
        bandpass: { frequency: 980, q: 4.2 },
        distortion: 38,
        compressor: { threshold: -26, knee: 10, ratio: 9, attack: 0.002, release: 0.18 },
        echo: { delay: 0.075, feedback: 0.18, wet: 0.26 },
      };
    }

    if (intensity === "amped") {
      return {
        playbackRate: 0.86,
        gain: 1.08,
        highpass: 130,
        lowpass: 3800,
        bandpass: { frequency: 1050, q: 2.8 },
        distortion: 24,
        compressor: { threshold: -24, knee: 14, ratio: 6, attack: 0.004, release: 0.2 },
        echo: { delay: 0.055, feedback: 0.1, wet: 0.16 },
      };
    }

    return {
      playbackRate: 0.94,
      gain: 1,
      highpass: 100,
      lowpass: 5000,
      bandpass: { frequency: 1150, q: 1.4 },
      distortion: 10,
      compressor: { threshold: -22, knee: 18, ratio: 4, attack: 0.006, release: 0.25 },
    };
  }

  if (settings.style === "hype-announcer") {
    if (intensity === "extreme") {
      return {
        playbackRate: 1.08,
        gain: 1.3,
        highpass: 85,
        lowshelf: { frequency: 180, gain: 3 },
        highshelf: { frequency: 3200, gain: 4 },
        distortion: 12,
        compressor: { threshold: -28, knee: 18, ratio: 11, attack: 0.003, release: 0.22 },
        echo: { delay: 0.16, feedback: 0.24, wet: 0.28 },
      };
    }

    if (intensity === "amped") {
      return {
        playbackRate: 1.04,
        gain: 1.18,
        highpass: 70,
        lowshelf: { frequency: 160, gain: 2 },
        highshelf: { frequency: 3500, gain: 2.5 },
        distortion: 5,
        compressor: { threshold: -26, knee: 20, ratio: 7, attack: 0.004, release: 0.26 },
        echo: { delay: 0.12, feedback: 0.14, wet: 0.18 },
      };
    }

    return {
      playbackRate: 1,
      gain: 1.06,
      highpass: 60,
      highshelf: { frequency: 3600, gain: 1.4 },
      compressor: { threshold: -24, knee: 24, ratio: 4, attack: 0.005, release: 0.3 },
      echo: { delay: 0.09, feedback: 0.06, wet: 0.08 },
    };
  }

  if (settings.style === "calm-narrator") {
    return {
      playbackRate: intensity === "extreme" ? 0.9 : intensity === "amped" ? 0.94 : 0.98,
      gain: intensity === "extreme" ? 1.02 : 0.98,
      lowpass: intensity === "extreme" ? 5200 : intensity === "amped" ? 6500 : 8200,
      lowshelf: { frequency: 220, gain: intensity === "extreme" ? 2 : 1 },
      compressor: { threshold: -22, knee: 28, ratio: 2.5, attack: 0.012, release: 0.45 },
    };
  }

  return {
    playbackRate: intensity === "extreme" ? 1.03 : intensity === "amped" ? 1.01 : 1,
    gain: intensity === "extreme" ? 1.12 : intensity === "amped" ? 1.06 : 1,
    highpass: 55,
    highshelf: {
      frequency: 3400,
      gain: intensity === "extreme" ? 3 : intensity === "amped" ? 1.8 : 0.8,
    },
    compressor: {
      threshold: intensity === "extreme" ? -26 : -23,
      knee: 20,
      ratio: intensity === "extreme" ? 6 : intensity === "amped" ? 4 : 2.5,
      attack: 0.005,
      release: 0.28,
    },
    echo:
      intensity === "extreme"
        ? { delay: 0.085, feedback: 0.08, wet: 0.1 }
        : undefined,
  };
}

function connectAudioEffects(
  audioContext: AudioContext,
  source: AudioBufferSourceNode,
  settings: VoiceAnnouncementSettings
) {
  const config = getAudioEffectConfig(settings);
  source.playbackRate.value = config.playbackRate;

  let current: AudioNode = source;

  if (config.highpass) {
    current = connectBiquad(audioContext, current, "highpass", config.highpass);
  }

  if (config.lowpass) {
    current = connectBiquad(audioContext, current, "lowpass", config.lowpass);
  }

  if (config.bandpass) {
    current = connectBiquad(
      audioContext,
      current,
      "bandpass",
      config.bandpass.frequency,
      config.bandpass.q
    );
  }

  if (config.lowshelf) {
    current = connectBiquad(
      audioContext,
      current,
      "lowshelf",
      config.lowshelf.frequency,
      undefined,
      config.lowshelf.gain
    );
  }

  if (config.highshelf) {
    current = connectBiquad(
      audioContext,
      current,
      "highshelf",
      config.highshelf.frequency,
      undefined,
      config.highshelf.gain
    );
  }

  if (config.distortion) {
    const distortion = audioContext.createWaveShaper();
    distortion.curve = createDistortionCurve(config.distortion);
    distortion.oversample = "4x";
    current.connect(distortion);
    current = distortion;
  }

  if (config.compressor) {
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = config.compressor.threshold;
    compressor.knee.value = config.compressor.knee;
    compressor.ratio.value = config.compressor.ratio;
    compressor.attack.value = config.compressor.attack;
    compressor.release.value = config.compressor.release;
    current.connect(compressor);
    current = compressor;
  }

  const output = audioContext.createGain();
  output.gain.value = config.gain;

  if (config.echo) {
    const dry = audioContext.createGain();
    dry.gain.value = 1;
    current.connect(dry);
    dry.connect(output);

    const delay = audioContext.createDelay(1);
    delay.delayTime.value = config.echo.delay;

    const feedback = audioContext.createGain();
    feedback.gain.value = config.echo.feedback;

    const wet = audioContext.createGain();
    wet.gain.value = config.echo.wet;

    current.connect(delay);
    delay.connect(wet);
    wet.connect(output);
    delay.connect(feedback);
    feedback.connect(delay);
    return output;
  }

  current.connect(output);
  return output;
}

async function playWithWebAudio(
  audioData: ArrayBuffer,
  settings: VoiceAnnouncementSettings
): Promise<boolean> {
  const AudioContextConstructor = getAudioContextConstructor();
  if (!AudioContextConstructor) return false;

  let audioContext: AudioContext | null = null;

  try {
    audioContext = new AudioContextConstructor();
    const decodedAudio = await audioContext.decodeAudioData(audioData.slice(0));
    const source = audioContext.createBufferSource();
    source.buffer = decodedAudio;

    const output = connectAudioEffects(audioContext, source, settings);
    output.connect(audioContext.destination);

    const cleanup = () => {
      try {
        output.disconnect();
      } catch {
        // Nodes may already be disconnected after a manual stop.
      }
      if (activeSource === source) activeSource = null;
      if (activeContext === audioContext) activeContext = null;
      if (activeCleanup === cleanup) activeCleanup = null;
      void audioContext?.close().catch(() => {});
    };

    activeSource = source;
    activeContext = audioContext;
    activeCleanup = cleanup;

    source.addEventListener("ended", cleanup, { once: true });

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    source.start(0);
    return true;
  } catch {
    void audioContext?.close().catch(() => {});
    return false;
  }
}

async function playHtmlAudio(audioBlob: Blob): Promise<boolean> {
  if (typeof Audio === "undefined") return false;

  let audioUrl = "";

  try {
    audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.addEventListener(
      "ended",
      () => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudio === audio) activeAudio = null;
      },
      { once: true }
    );

    audio.addEventListener(
      "error",
      () => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudio === audio) activeAudio = null;
      },
      { once: true }
    );

    activeAudio = audio;
    await audio.play();
    return true;
  } catch {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    return false;
  }
}

async function playGeneratedSpeech(
  name: string,
  settings: VoiceAnnouncementSettings
): Promise<boolean> {
  if (!supportsVoiceAnnouncements()) return false;

  try {
    const response = await fetch("/api/announcements/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        style: settings.style,
        intensity: settings.intensity,
        template: settings.template,
      }),
    });

    if (!response.ok) return false;

    const audioData = await response.arrayBuffer();
    stopCurrentAnnouncement();

    const webAudioPlayed = await playWithWebAudio(audioData, settings);
    if (webAudioPlayed) return true;

    return playHtmlAudio(new Blob([audioData], { type: "audio/mpeg" }));
  } catch {
    return false;
  }
}

export async function speakWinner(
  name: string,
  settings: VoiceAnnouncementSettings
): Promise<boolean> {
  if (!settings.enabled) return false;
  const generatedSpeechPlayed = await playGeneratedSpeech(name, settings);
  if (generatedSpeechPlayed) return true;

  return speakText(buildAnnouncement(name, settings.template), settings);
}

export async function previewVoice(
  settings: VoiceAnnouncementSettings,
  sampleName = "Alex"
): Promise<boolean> {
  const generatedSpeechPlayed = await playGeneratedSpeech(sampleName, settings);
  if (generatedSpeechPlayed) return true;

  return speakText(buildAnnouncement(sampleName, settings.template), settings);
}
