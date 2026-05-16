"use client";

import { Member } from "@/lib/types";

interface RoundRecapProps {
  members: Member[];
  orderIds: string[];
  totalEligible: number;
  oooCount: number;
}

export default function RoundRecap({
  members,
  orderIds,
  totalEligible,
  oooCount,
}: RoundRecapProps) {
  const orderedMembers = orderIds
    .map((id) => members.find((member) => member.id === id))
    .filter(Boolean) as Member[];

  if (orderedMembers.length === 0) return null;

  const speakerCount = orderedMembers.length;
  const opener = orderedMembers[0];
  const closer = orderedMembers[speakerCount - 1];
  const middlePick =
    speakerCount >= 3 ? orderedMembers[Math.floor(speakerCount / 2)] : null;
  const arcadeScore = speakerCount * 100 + Math.min(oooCount, 9) * 25;
  const pace =
    speakerCount >= 8
      ? "Marathon lineup"
      : speakerCount >= 5
        ? "Full table"
        : speakerCount >= 3
          ? "Quick loop"
          : "Fast round";
  const completionText =
    speakerCount === totalEligible
      ? "Everyone eligible made it through."
      : `${speakerCount} of ${totalEligible} eligible speakers finished.`;
  const oooText = oooCount > 0 ? ` ${oooCount} OOO skipped cleanly.` : "";

  return (
    <section
      aria-label="Round statistics"
      className="mt-3 w-full max-w-[520px] rounded-lg border border-skin-border bg-skin-bg-secondary/75 p-3 shadow-xl backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-skin-text-secondary">
            Round Recap
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-skin-text">
            {pace}
          </p>
        </div>
        <div className="shrink-0 rounded border border-skin-accent px-2.5 py-1 text-right">
          <p className="text-[9px] font-bold uppercase tracking-wider text-skin-text-secondary">
            Score
          </p>
          <p className="text-sm font-bold text-skin-accent">{arcadeScore}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <RecapStat label="Speakers" value={`${speakerCount}/${totalEligible}`} />
        <RecapStat label="Opener" value={opener.name} />
        <RecapStat label="Closer" value={closer.name} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-skin-text-secondary">
        {completionText}
        {oooText}
        {middlePick ? ` Wildcard middle pick: ${middlePick.name}.` : ""}
      </p>
    </section>
  );
}

function RecapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded border border-skin-border bg-black/20 px-2.5 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-skin-text-secondary">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-bold text-skin-text" title={value}>
        {value}
      </p>
    </div>
  );
}
