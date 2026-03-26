"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { subscribeToSession, subscribeToMembers } from "@/lib/realtime";
import { Team, Member, SessionState } from "@/lib/types";
import SkinProvider from "@/components/SkinProvider";
import SlotReel from "@/components/SlotReel";
import SpinButton from "@/components/SpinButton";
import MemberPool from "@/components/MemberPool";
import OrderList from "@/components/OrderList";
import CoinRow from "@/components/CoinRow";
import OOOToggle from "@/components/OOOToggle";
import type { SkinName } from "@/lib/skins";
import Link from "next/link";

interface TeamWorkspaceProps {
  initialTeam: Team;
  initialMembers: Member[];
  initialSession: SessionState | null;
}

export default function TeamWorkspace({
  initialTeam,
  initialMembers,
  initialSession,
}: TeamWorkspaceProps) {
  const [team, setTeam] = useState<Team>(initialTeam);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [session, setSession] = useState<SessionState | null>(initialSession);
  const [showBanner, setShowBanner] = useState(false);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  const activeMembers = members.filter((m) => m.is_active);
  const oooMembers = activeMembers.filter((m) => m.ooo_date === today);
  const availableMembers = activeMembers.filter((m) => m.ooo_date !== today);

  const currentWinner = session?.current_winner
    ? members.find((m) => m.id === session.current_winner) || null
    : null;

  const poolEmpty =
    !session?.spin_pool || session.spin_pool.length === 0;
  const allPicked =
    poolEmpty && (session?.order_picked?.length ?? 0) > 0;

  // Fetch fresh members
  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("team_id", team.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (data) setMembers(data);
  }, [supabase, team.id]);

  // Fetch team for skin changes
  const fetchTeam = useCallback(async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .eq("id", team.id)
      .single();
    if (data) setTeam(data);
  }, [supabase, team.id]);

  // Subscribe to realtime updates
  useEffect(() => {
    const sessionChannel = subscribeToSession(
      supabase,
      team.id,
      (payload) => {
        setSession(payload as unknown as SessionState);
      }
    );

    const membersChannel = subscribeToMembers(supabase, team.id, () => {
      fetchMembers();
    });

    // Also subscribe to team changes (for skin updates)
    const teamChannel = supabase
      .channel(`team:${team.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
          filter: `id=eq.${team.id}`,
        },
        () => fetchTeam()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(teamChannel);
    };
  }, [supabase, team.id, fetchMembers, fetchTeam]);

  // Show share banner on first visit
  useEffect(() => {
    const key = `standup-slots-visited-${team.slug}`;
    if (!localStorage.getItem(key)) {
      setShowBanner(true);
      localStorage.setItem(key, "true");
    }
  }, [team.slug]);

  // Spin action
  const handleSpin = async () => {
    if (!session || availableMembers.length === 0) return;

    const pool = session.spin_pool.length > 0
      ? session.spin_pool
      : availableMembers.map((m) => m.id);

    // Pick random winner from pool
    const winnerId = pool[Math.floor(Math.random() * pool.length)];

    await supabase
      .from("session_state")
      .update({
        status: "spinning",
        current_winner: winnerId,
        spin_pool: pool,
        updated_at: new Date().toISOString(),
      })
      .eq("team_id", team.id);

    // After animation time, set to winner
    setTimeout(async () => {
      await supabase
        .from("session_state")
        .update({
          status: "winner",
          updated_at: new Date().toISOString(),
        })
        .eq("team_id", team.id);
    }, 2800);
  };

  // Confirm / Next
  const handleNext = async () => {
    if (!session?.current_winner) return;

    const newPool = session.spin_pool.filter(
      (id) => id !== session.current_winner
    );
    const newOrder = [...(session.order_picked || []), session.current_winner];

    await supabase
      .from("session_state")
      .update({
        status: "idle",
        spin_pool: newPool,
        order_picked: newOrder,
        current_winner: null,
        updated_at: new Date().toISOString(),
      })
      .eq("team_id", team.id);
  };

  // Reset session
  const handleReset = async () => {
    const pool = availableMembers.map((m) => m.id);

    await supabase
      .from("session_state")
      .update({
        status: "idle",
        spin_pool: pool,
        order_picked: [],
        current_winner: null,
        updated_at: new Date().toISOString(),
      })
      .eq("team_id", team.id);
  };

  // New session (same as reset but with confirmation)
  const handleNewSession = async () => {
    if (!confirm("Start a new session? Current order will be cleared.")) return;
    await handleReset();
  };

  // Initialize session if it doesn't exist
  const initSession = useCallback(async () => {
    if (session) return;
    const pool = availableMembers.map((m) => m.id);
    const { data } = await supabase
      .from("session_state")
      .insert({
        team_id: team.id,
        status: "idle",
        spin_pool: pool,
        order_picked: [],
      })
      .select()
      .single();
    if (data) setSession(data);
  }, [session, availableMembers, supabase, team.id]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Copy link
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = session?.status as "idle" | "spinning" | "winner" || "idle";

  return (
    <>
      <SkinProvider skin={team.skin as SkinName} />

      <main className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-skin-accent">
              {team.name}
            </h1>
            <p className="text-xs text-skin-text-secondary">STANDUP SLOTS</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs border border-skin-border rounded hover:bg-skin-muted transition-colors"
            >
              {copied ? "COPIED!" : "COPY LINK"}
            </button>
            <Link
              href={`/team/${team.slug}/settings`}
              className="px-3 py-1.5 text-xs border border-skin-border rounded hover:bg-skin-muted transition-colors"
            >
              SETTINGS
            </Link>
          </div>
        </div>

        {/* Share banner */}
        {showBanner && (
          <div className="mb-6 p-3 border border-skin-accent rounded-lg bg-skin-bg-secondary flex items-center justify-between">
            <span className="text-xs text-skin-accent">
              Share this link with your team to get started!
            </span>
            <button
              onClick={() => setShowBanner(false)}
              className="text-skin-text-secondary hover:text-skin-text text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* No members state */}
        {activeMembers.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-skin-text-secondary text-sm">
              No team members yet.
            </p>
            <Link
              href={`/team/${team.slug}/settings`}
              className="inline-block px-6 py-3 bg-skin-button-bg text-skin-button-text rounded-lg hover:bg-skin-button-hover transition-colors font-bold"
            >
              ADD MEMBERS
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Coin row */}
            <CoinRow
              total={availableMembers.length}
              remaining={session?.spin_pool?.length ?? availableMembers.length}
            />

            {/* Slot reel */}
            <SlotReel
              status={status}
              members={availableMembers}
              currentWinner={currentWinner}
            />

            {/* Spin button */}
            <div className="flex justify-center">
              <SpinButton
                status={allPicked ? "idle" : status}
                poolEmpty={allPicked}
                onSpin={handleSpin}
                onNext={handleNext}
                onReset={handleReset}
                onNewSession={handleNewSession}
              />
            </div>

            {/* Order list */}
            <OrderList
              members={members}
              orderIds={session?.order_picked || []}
            />

            {/* Member pool + OOO */}
            <div className="border-t border-skin-border pt-6 space-y-4">
              <MemberPool
                members={members}
                poolIds={session?.spin_pool || []}
                oooMembers={oooMembers}
              />

              {/* OOO toggles */}
              <div className="space-y-2">
                <h3 className="text-xs text-skin-text-secondary uppercase tracking-wider">
                  Quick OOO Toggle
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeMembers.map((member) => (
                    <OOOToggle
                      key={member.id}
                      member={member}
                      isOOO={member.ooo_date === today}
                      onToggle={async (memberId, ooo) => {
                        await supabase
                          .from("members")
                          .update({
                            ooo_date: ooo ? today : null,
                          })
                          .eq("id", memberId);
                        fetchMembers();
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
