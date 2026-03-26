import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import SettingsWorkspace from "./SettingsWorkspace";

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

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("team_id", team.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return { team, members: members || [] };
}

export default async function SettingsPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getTeamData(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <SettingsWorkspace initialTeam={data.team} initialMembers={data.members} />
  );
}
