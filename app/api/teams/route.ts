import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createTeamSchema } from "@/lib/validations";
import { sanitize } from "@/lib/sanitize";
import { isReservedSlug, containsBlockedContent } from "@/lib/blocklist";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate input
  const result = createTeamSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, slug } = result.data;

  // Check reserved slugs
  if (isReservedSlug(slug)) {
    return NextResponse.json(
      { error: "This slug is reserved" },
      { status: 400 }
    );
  }

  // Sanitize
  let sanitizedName: string;
  try {
    sanitizedName = sanitize(name, 80);
  } catch {
    return NextResponse.json(
      { error: "Team name contains inappropriate content" },
      { status: 400 }
    );
  }

  if (containsBlockedContent(slug)) {
    return NextResponse.json(
      { error: "Slug contains inappropriate content" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Check if slug is taken
  const { data: existing } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken" },
      { status: 409 }
    );
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ name: sanitizedName, slug })
    .select()
    .single();

  if (teamError) {
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }

  // Create empty session state
  await supabase.from("session_state").insert({
    team_id: team.id,
    status: "idle",
    spin_pool: [],
    order_picked: [],
  });

  return NextResponse.json({ slug: team.slug, id: team.id }, { status: 201 });
}
