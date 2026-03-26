import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export function subscribeToSession(
  supabase: SupabaseClient,
  teamId: string,
  onUpdate: (payload: Record<string, unknown>) => void
): RealtimeChannel {
  return supabase
    .channel(`session:${teamId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "session_state",
        filter: `team_id=eq.${teamId}`,
      },
      (payload) => onUpdate(payload.new as Record<string, unknown>)
    )
    .subscribe();
}

export function subscribeToMembers(
  supabase: SupabaseClient,
  teamId: string,
  onUpdate: () => void
): RealtimeChannel {
  return supabase
    .channel(`members:${teamId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "members",
        filter: `team_id=eq.${teamId}`,
      },
      () => onUpdate()
    )
    .subscribe();
}
