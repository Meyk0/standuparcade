"use client";

import { Member } from "@/lib/types";

interface OrderListProps {
  members: Member[];
  orderIds: string[];
}

export default function OrderList({ members, orderIds }: OrderListProps) {
  const orderedMembers = orderIds
    .map((id) => members.find((m) => m.id === id))
    .filter(Boolean) as Member[];

  if (orderedMembers.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs sm:text-sm text-skin-text-secondary uppercase tracking-wider">
        Order
      </h3>
      <ol className="space-y-1.5">
        {orderedMembers.map((member, index) => (
          <li
            key={member.id}
            className="flex items-center gap-3 text-sm sm:text-base"
          >
            <span className="text-skin-accent font-bold w-6 text-right">
              {index + 1}.
            </span>
            <span className="text-skin-text">{member.name}</span>
            {member.tagline && (
              <span className="text-skin-text-secondary text-xs hidden sm:inline">
                — {member.tagline}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
