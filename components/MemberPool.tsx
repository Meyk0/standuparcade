"use client";

import { Member } from "@/lib/types";

interface MemberPoolProps {
  members: Member[];
  poolIds: string[];
  oooMembers: Member[];
}

export default function MemberPool({
  members,
  poolIds,
  oooMembers,
}: MemberPoolProps) {
  const poolMembers = members.filter((m) => poolIds.includes(m.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm text-skin-text-secondary uppercase tracking-wider">
          Remaining ({poolMembers.length})
        </h3>
        {oooMembers.length > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-skin-muted text-skin-text-secondary">
            {oooMembers.length} OOO
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {poolMembers.map((member) => (
          <span
            key={member.id}
            className="px-3 py-1.5 text-xs sm:text-sm rounded border border-skin-border bg-skin-bg-secondary text-skin-text"
          >
            {member.name}
          </span>
        ))}
        {poolMembers.length === 0 && (
          <span className="text-skin-text-secondary text-xs italic">
            Pool empty
          </span>
        )}
      </div>
    </div>
  );
}
