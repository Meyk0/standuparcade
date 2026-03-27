"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { subscribeToMembers } from "@/lib/realtime";
import { Team, Member } from "@/lib/types";
import { SkinName } from "@/lib/skins";
import SkinProvider from "@/components/SkinProvider";
import RosterManager from "@/components/RosterManager";
import SkinPicker from "@/components/SkinPicker";
import CasinoBackground from "@/components/CasinoBackground";

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
  const router = useRouter();

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("team_id", team.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (data) setMembers(data);
  }, [supabase, team.id]);

  useEffect(() => {
    const channel = subscribeToMembers(supabase, team.id, fetchMembers);
    return () => { supabase.removeChannel(channel); };
  }, [supabase, team.id, fetchMembers]);

  const handleSkinChange = (newSkin: SkinName) => {
    setSkin(newSkin);
    setTeam((prev) => ({ ...prev, skin: newSkin }));
  };

  const cardClass = "bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl";
  const goBack = () => { window.location.href = `/team/${team.slug}`; };

  return (
    <>
      <SkinProvider skin={skin} />
      <CasinoBackground>
        <main className="min-h-screen p-4 sm:p-8">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-yellow-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  {team.name}
                </h1>
                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Settings</p>
              </div>
              <button
                onClick={goBack}
                className="px-4 py-2 text-xs font-bold uppercase rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
              >
                ← Back
              </button>
            </div>

            {/* Machine Type */}
            <div className={cardClass}>
              <SkinPicker
                teamId={team.id}
                currentSkin={skin}
                onSkinChange={handleSkinChange}
              />
            </div>

            {/* Roster */}
            <div className={cardClass}>
              <RosterManager
                teamId={team.id}
                members={members}
                onMembersChange={fetchMembers}
              />
            </div>

            {/* Start standup CTA */}
            {members.length > 0 && (
              <button
                onClick={goBack}
                className="w-full py-4 text-sm font-bold uppercase tracking-wider rounded-xl transition-all bg-gradient-to-b from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 shadow-lg shadow-yellow-500/20"
              >
                START STANDUP →
              </button>
            )}

          </div>
        </main>
      </CasinoBackground>
    </>
  );
}
