"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { subscribeToMembers } from "@/lib/realtime";
import { Team, Member } from "@/lib/types";
import { SkinName } from "@/lib/skins";
import SkinProvider from "@/components/SkinProvider";
import RosterManager from "@/components/RosterManager";
import SkinPicker from "@/components/SkinPicker";
import Link from "next/link";

interface SettingsWorkspaceProps {
  initialTeam: Team;
  initialMembers: Member[];
}

export default function SettingsWorkspace({
  initialTeam,
  initialMembers,
}: SettingsWorkspaceProps) {
  const [team, setTeam] = useState<Team>(initialTeam);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [skin, setSkin] = useState<SkinName>(initialTeam.skin as SkinName);

  const supabase = createClient();

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("team_id", team.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (data) setMembers(data);
  }, [supabase, team.id]);

  // Subscribe to member changes from other clients
  useEffect(() => {
    const channel = subscribeToMembers(supabase, team.id, fetchMembers);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, team.id, fetchMembers]);

  const handleSkinChange = (newSkin: SkinName) => {
    setSkin(newSkin);
    setTeam((prev) => ({ ...prev, skin: newSkin }));
  };

  return (
    <>
      <SkinProvider skin={skin} />

      <main className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-skin-accent">
              {team.name}
            </h1>
            <p className="text-xs text-skin-text-secondary">SETTINGS</p>
          </div>
          <Link
            href={`/team/${team.slug}`}
            className="px-4 py-2 text-sm border border-skin-border rounded hover:bg-skin-muted transition-colors"
          >
            ← BACK
          </Link>
        </div>

        <div className="space-y-10">
          {/* Skin picker */}
          <SkinPicker
            teamId={team.id}
            currentSkin={skin}
            onSkinChange={handleSkinChange}
          />

          {/* Roster manager */}
          <RosterManager
            teamId={team.id}
            members={members}
            onMembersChange={fetchMembers}
          />
        </div>
      </main>
    </>
  );
}
