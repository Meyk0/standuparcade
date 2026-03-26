"use client";

import { useEffect } from "react";
import { SkinName, SKINS } from "@/lib/skins";

interface SkinProviderProps {
  skin: SkinName;
}

export default function SkinProvider({ skin }: SkinProviderProps) {
  useEffect(() => {
    document.documentElement.setAttribute("data-skin", skin);

    // Load the skin's font
    const skinDef = SKINS[skin];
    if (skinDef) {
      const existingLink = document.querySelector(
        `link[data-skin-font="${skin}"]`
      );
      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = skinDef.fontUrl;
        link.setAttribute("data-skin-font", skin);
        document.head.appendChild(link);
      }
    }
  }, [skin]);

  return null;
}
