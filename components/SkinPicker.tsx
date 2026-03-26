"use client";

import { SKINS, SkinName, SKIN_NAMES } from "@/lib/skins";
import { createClient } from "@/lib/supabase";

interface SkinPickerProps {
  teamId: string;
  currentSkin: SkinName;
  onSkinChange: (skin: SkinName) => void;
}

// Preview colors for each skin (to show in the picker)
const SKIN_PREVIEW_COLORS: Record<SkinName, { bg: string; accent: string; text: string }> = {
  arcade: { bg: "#0a0a0a", accent: "#33ff33", text: "#ffd700" },
  synthwave: { bg: "#1a0533", accent: "#ff71ce", text: "#00ffff" },
  noir: { bg: "#0d0d0d", accent: "#cc2222", text: "#d4d0c8" },
  harajuku: { bg: "#ffe4ec", accent: "#b19cd9", text: "#4a2040" },
  "pub-quiz": { bg: "#1b3a2d", accent: "#d4a843", text: "#e8e0d0" },
};

export default function SkinPicker({
  teamId,
  currentSkin,
  onSkinChange,
}: SkinPickerProps) {
  const supabase = createClient();

  const handleSelect = async (skin: SkinName) => {
    await supabase.from("teams").update({ skin }).eq("id", teamId);
    onSkinChange(skin);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-skin-accent uppercase tracking-wider">
        Theme
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SKIN_NAMES.map((skinName) => {
          const skin = SKINS[skinName];
          const colors = SKIN_PREVIEW_COLORS[skinName];
          const isActive = skinName === currentSkin;

          return (
            <button
              key={skinName}
              onClick={() => handleSelect(skinName)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? "border-skin-accent shadow-lg"
                  : "border-skin-border hover:border-skin-text-secondary"
              }`}
              style={{ backgroundColor: colors.bg }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors.accent }}
                />
                <span
                  className="font-bold text-sm"
                  style={{ color: colors.text }}
                >
                  {skin.label}
                </span>
                {isActive && (
                  <span
                    className="text-xs ml-auto"
                    style={{ color: colors.accent }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
              <p
                className="text-xs opacity-70"
                style={{ color: colors.text }}
              >
                {skin.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
