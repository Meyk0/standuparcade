"use client";

import { useEffect, useState } from "react";
import {
  ANNOUNCEMENT_TEMPLATES,
  AnnouncementTemplate,
  buildAnnouncement,
  previewVoice,
  supportsVoiceAnnouncements,
  VOICE_INTENSITIES,
  VOICE_STYLES,
  VoiceAnnouncementSettings,
  VoiceIntensity,
  VoiceStyle,
} from "@/lib/announcements";

interface VoiceAnnouncementControlProps {
  settings: VoiceAnnouncementSettings;
  onChange: (settings: VoiceAnnouncementSettings) => void;
}

const VOICE_STYLE_ORDER: VoiceStyle[] = [
  "classic-host",
  "arcade-robot",
  "hype-announcer",
  "calm-narrator",
];

const INTENSITY_ORDER: VoiceIntensity[] = ["clean", "amped", "extreme"];

const TEMPLATE_ORDER: AnnouncementTemplate[] = [
  "surprise",
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

export default function VoiceAnnouncementControl({
  settings,
  onChange,
}: VoiceAnnouncementControlProps) {
  const [open, setOpen] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    setVoiceSupported(supportsVoiceAnnouncements());
  }, []);

  const updateSettings = (next: Partial<VoiceAnnouncementSettings>) => {
    setPreviewError("");
    onChange({ ...settings, ...next });
  };

  const handlePreview = async () => {
    setPreviewError("");
    setPreviewing(true);
    const spoken = await previewVoice(settings);
    setPreviewing(false);

    if (!spoken) {
      setPreviewError("Voice playback is not supported in this browser.");
    }
  };

  const phrasePreview =
    settings.template === "surprise"
      ? `Mixes phrases by winner. Example: ${buildAnnouncement("Alex", settings.template)}`
      : buildAnnouncement("Alex", settings.template);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-pressed={settings.enabled}
        className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          settings.enabled
            ? "border-skin-accent text-skin-accent"
            : "border-skin-border text-skin-text-secondary hover:bg-skin-muted"
        }`}
        title={
          settings.enabled
            ? "Voice announcements on"
            : "Voice announcements off"
        }
      >
        Voice {settings.enabled ? "On" : "Off"}
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 z-[90] mb-2 w-[300px] rounded-lg border border-skin-border bg-skin-bg-secondary p-4 text-left shadow-2xl"
          role="dialog"
          aria-modal="false"
          aria-labelledby="voice-announcement-title"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="voice-announcement-title"
                className="text-xs font-bold uppercase tracking-wider text-skin-accent"
              >
                Voice
              </h2>
              <p className="mt-1 text-[10px] leading-relaxed text-skin-text-secondary">
                Announce winners from this browser only. AI-generated audio is
                used when OpenAI is configured.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm leading-none text-skin-text-secondary hover:text-skin-text"
              aria-label="Close voice settings"
            >
              x
            </button>
          </div>

          <label className="mt-4 flex items-center justify-between gap-3 rounded border border-skin-border bg-black/20 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-skin-text">
              Announce Winner
            </span>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) =>
                updateSettings({ enabled: event.target.checked })
              }
              className="h-4 w-4 accent-yellow-400"
              disabled={!voiceSupported}
            />
          </label>

          {!voiceSupported && (
            <p className="mt-2 text-[10px] leading-relaxed text-skin-danger">
              Voice playback is not supported in this browser.
            </p>
          )}

          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-skin-text-secondary">
              Voice Style
            </p>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_STYLE_ORDER.map((style) => {
                const isActive = settings.style === style;
                const styleDef = VOICE_STYLES[style];

                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => updateSettings({ style })}
                    className={`rounded border px-2 py-2 text-left transition-colors ${
                      isActive
                        ? "border-skin-accent bg-skin-muted text-skin-accent"
                        : "border-skin-border bg-black/20 text-skin-text-secondary hover:bg-skin-muted"
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider">
                      {styleDef.label}
                    </span>
                    <span className="mt-1 block text-[9px] leading-snug opacity-70">
                      {styleDef.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-skin-text-secondary">
              Intensity
            </p>
            <div className="grid grid-cols-3 gap-2">
              {INTENSITY_ORDER.map((intensity) => {
                const isActive = settings.intensity === intensity;
                const intensityDef = VOICE_INTENSITIES[intensity];

                return (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => updateSettings({ intensity })}
                    className={`rounded border px-2 py-2 text-center transition-colors ${
                      isActive
                        ? "border-skin-accent bg-skin-muted text-skin-accent"
                        : "border-skin-border bg-black/20 text-skin-text-secondary hover:bg-skin-muted"
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider">
                      {intensityDef.label}
                    </span>
                    <span className="mt-1 block text-[9px] leading-snug opacity-70">
                      {intensityDef.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label
              htmlFor="announcement-template"
              className="block text-[10px] font-bold uppercase tracking-wider text-skin-text-secondary"
            >
              Phrase
            </label>
            <select
              id="announcement-template"
              value={settings.template}
              onChange={(event) =>
                updateSettings({
                  template: event.target.value as AnnouncementTemplate,
                })
              }
              className="w-full rounded border border-skin-border bg-black/40 px-3 py-2 text-xs text-skin-text focus:border-skin-accent focus:outline-none"
            >
              {TEMPLATE_ORDER.map((template) => (
                <option key={template} value={template}>
                  {ANNOUNCEMENT_TEMPLATES[template].label}
                </option>
              ))}
            </select>
            <p className="text-[10px] leading-relaxed text-skin-text-secondary">
              {phrasePreview}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePreview}
            disabled={!voiceSupported || previewing}
            className="mt-4 w-full rounded-lg bg-skin-button-bg px-4 py-2 text-xs font-bold uppercase tracking-wider text-skin-button-text transition-colors hover:bg-skin-button-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {previewing ? "Testing..." : "Test Voice"}
          </button>

          {previewError && (
            <p className="mt-2 text-[10px] leading-relaxed text-skin-danger">
              {previewError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
