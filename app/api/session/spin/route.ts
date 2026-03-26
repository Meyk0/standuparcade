import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { spinSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = spinSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { team_id, winner_id } = result.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Verify the winner is in the spin pool
  const { data: session } = await supabase
    .from("session_state")
    .select("*")
    .eq("team_id", team_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (
    session.spin_pool.length > 0 &&
    !session.spin_pool.includes(winner_id)
  ) {
    return NextResponse.json(
      { error: "Winner is not in the spin pool" },
      { status: 400 }
    );
  }

  // Update session
  const { error } = await supabase
    .from("session_state")
    .update({
      status: "spinning",
      current_winner: winner_id,
      updated_at: new Date().toISOString(),
    })
    .eq("team_id", team_id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
