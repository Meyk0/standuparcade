import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { slugSchema } from "@/lib/validations";
import { isReservedSlug } from "@/lib/blocklist";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // Validate format
  const result = slugSchema.safeParse(slug);
  if (!result.success) {
    return NextResponse.json(
      { available: false, error: result.error.issues[0].message },
      { status: 200 }
    );
  }

  if (isReservedSlug(slug)) {
    return NextResponse.json(
      { available: false, error: "This slug is reserved" },
      { status: 200 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", slug)
    .single();

  if (data) {
    // Suggest alternatives
    const suggestions = [`${slug}-2`, `${slug}-hq`, `${slug}-team`].filter(
      (s) => s.length <= 40
    );
    return NextResponse.json(
      { available: false, suggestions },
      { status: 200 }
    );
  }

  return NextResponse.json({ available: true }, { status: 200 });
}
