"use client";

import { Member } from "@/lib/types";

interface OOOToggleProps {
  member: Member;
  isOOO: boolean;
  onToggle: (memberId: string, ooo: boolean) => void;
}

export default function OOOToggle({ member, isOOO, onToggle }: OOOToggleProps) {
  return (
    <button
      onClick={() => onToggle(member.id, !isOOO)}
      className={`px-3 py-1.5 text-xs rounded border transition-all ${
        isOOO
          ? "border-skin-danger bg-skin-danger/10 text-skin-danger line-through opacity-60"
          : "border-skin-border bg-skin-bg-secondary text-skin-text hover:bg-skin-muted"
      }`}
    >
      {member.name} {isOOO && "(OOO)"}
    </button>
  );
}
