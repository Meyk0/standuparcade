"use client";

import { SKINS, SkinName, SKIN_NAMES } from "@/lib/skins";
import { createClient } from "@/lib/supabase";

interface SkinPickerProps {
  teamId: string;
  currentSkin: SkinName;
  onSkinChange: (skin: SkinName) => void;
}

const SKIN_PREVIEW_COLORS: Record<SkinName, { bg: string; accent: string; text: string }> = {
  "classic-vegas": { bg: "#1a1510", accent: "#ffd700", text: "#e8d8b0" },
  "lucky-dragon": { bg: "#1a0505", accent: "#ff2222", text: "#ffd700" },
  pharaoh: { bg: "#0a0a18", accent: "#ffd700", text: "#e8d8a0" },
  "retro-arcade": { bg: "#0a0a0a", accent: "#33ff33", text: "#33ff33" },
  "fruit-machine": { bg: "#1b2a1d", accent: "#d4a843", text: "#e8e0d0" },
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
      <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-widest">
        Machine Type
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
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? "border-yellow-500 shadow-lg shadow-yellow-500/10"
                  : "border-white/10 hover:border-white/30"
              }`}
              style={{ backgroundColor: colors.bg }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
                <span className="font-bold text-xs" style={{ color: colors.text }}>
                  {skin.label}
                </span>
                {isActive && (
                  <span className="text-[9px] ml-auto" style={{ color: colors.accent }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] opacity-60" style={{ color: colors.text }}>
                {skin.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
