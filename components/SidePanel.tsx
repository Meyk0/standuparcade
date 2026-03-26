"use client";

import { useState, ReactNode } from "react";

interface SidePanelProps {
  children: ReactNode;
  sections: { title: string; content: ReactNode }[];
}

export default function SidePanel({ sections }: SidePanelProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={index}
          className="rounded-lg overflow-hidden border"
          style={{
            borderColor: "var(--skin-border)",
            background: "var(--skin-bg-secondary)",
          }}
        >
          <button
            onClick={() => toggleSection(index)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider font-bold hover:opacity-80 transition-opacity"
            style={{ color: "var(--skin-text-secondary)" }}
          >
            <span>{section.title}</span>
            <span
              className="transition-transform"
              style={{
                transform: openSections.has(index) ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▼
            </span>
          </button>
          {openSections.has(index) && (
            <div className="px-3 pb-3">{section.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
