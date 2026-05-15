export type VoiceStyle =
  | "classic-host"
  | "arcade-robot"
  | "hype-announcer"
  | "calm-narrator";

export type AnnouncementTemplate =
  | "youre-up"
  | "next-player"
  | "player-one"
  | "jackpot"
  | "spotlight";

export interface VoiceAnnouncementSettings {
  enabled: boolean;
  style: VoiceStyle;
  template: AnnouncementTemplate;
}

interface VoiceStyleDefinition {
  label: string;
  description: string;
  rate: number;
  pitch: number;
}

interface AnnouncementTemplateDefinition {
  label: string;
  text: string;
}

export const VOICE_ANNOUNCEMENT_STORAGE_KEY =
  "standup-slots-voice-announcements";

export const DEFAULT_VOICE_SETTINGS: VoiceAnnouncementSettings = {
  enabled: false,
  style: "classic-host",
  template: "youre-up",
};

export const VOICE_STYLES: Record<VoiceStyle, VoiceStyleDefinition> = {
  "classic-host": {
    label: "Classic Host",
    description: "Clear meeting-room host",
    rate: 0.95,
    pitch: 1,
  },
  "arcade-robot": {
    label: "Arcade Robot",
    description: "Lower, slower cabinet voice",
    rate: 0.82,
    pitch: 0.65,
  },
  "hype-announcer": {
    label: "Hype Announcer",
    description: "Fast and energetic",
    rate: 1.08,
    pitch: 1.25,
  },
  "calm-narrator": {
    label: "Calm Narrator",
    description: "Softer standup flow",
    rate: 0.9,
    pitch: 0.9,
  },
};

export const ANNOUNCEMENT_TEMPLATES: Record<
  AnnouncementTemplate,
  AnnouncementTemplateDefinition
> = {
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
};

function isVoiceStyle(value: unknown): value is VoiceStyle {
  return typeof value === "string" && value in VOICE_STYLES;
}

function isAnnouncementTemplate(value: unknown): value is AnnouncementTemplate {
  return typeof value === "string" && value in ANNOUNCEMENT_TEMPLATES;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getStoredVoiceSettings(): VoiceAnnouncementSettings {
  if (typeof window === "undefined") return DEFAULT_VOICE_SETTINGS;

  try {
    const raw = window.localStorage.getItem(VOICE_ANNOUNCEMENT_STORAGE_KEY);
    if (!raw) return DEFAULT_VOICE_SETTINGS;

    const parsed = JSON.parse(raw);
    if (!isObject(parsed)) return DEFAULT_VOICE_SETTINGS;

    return {
      enabled:
        typeof parsed.enabled === "boolean"
          ? parsed.enabled
          : DEFAULT_VOICE_SETTINGS.enabled,
      style: isVoiceStyle(parsed.style)
        ? parsed.style
        : DEFAULT_VOICE_SETTINGS.style,
      template: isAnnouncementTemplate(parsed.template)
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

export function buildAnnouncement(
  name: string,
  template: AnnouncementTemplate
): string {
  return ANNOUNCEMENT_TEMPLATES[template].text.replace("{name}", name);
}

export function supportsSpeechSynthesis(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

function speakText(text: string, settings: VoiceAnnouncementSettings): boolean {
  if (!supportsSpeechSynthesis()) return false;

  const style = VOICE_STYLES[settings.style];
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = style.rate;
  utterance.pitch = style.pitch;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakWinner(
  name: string,
  settings: VoiceAnnouncementSettings
): boolean {
  if (!settings.enabled) return false;
  return speakText(buildAnnouncement(name, settings.template), settings);
}

export function previewVoice(
  settings: VoiceAnnouncementSettings,
  sampleName = "Alex"
): boolean {
  return speakText(buildAnnouncement(sampleName, settings.template), settings);
}

