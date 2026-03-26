import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import TeamWorkspace from "./TeamWorkspace";

// Server-side data fetching
async function getTeamData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!team) return null;

  const [{ data: members }, { data: session }] = await Promise.all([
    supabase
      .from("members")
      .select("*")
      .eq("team_id", team.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("session_state")
      .select("*")
      .eq("team_id", team.id)
      .single(),
  ]);

  return { team, members: members || [], session };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getTeamData(params.slug);
  if (!data) {
    return { title: "Team Not Found — Standup Slots" };
  }
  return {
    title: `${data.team.name} · Standup Slots`,
    description: `Standup order picker for ${data.team.name}. Spin to pick who goes next!`,
    openGraph: {
      title: `${data.team.name} · Standup Slots`,
      description: `Standup order picker for ${data.team.name}. Spin to pick who goes next!`,
    },
  };
}

export default async function TeamPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getTeamData(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <TeamWorkspace
      initialTeam={data.team}
      initialMembers={data.members}
      initialSession={data.session}
    />
  );
}
