import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function getPostsCount(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const { count } = await admin
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .eq("is_active", true);

  return count ?? 0;
}

type Context = {
  params: Promise<{
    user_id: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  try {
    const { user_id } = await context.params;
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select(
        "id, email, username, first_name, last_name, bio, avatar_url, website, location, last_login_at, created_at, updated_at",
      )
      .eq("id", user_id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const posts_count = await getPostsCount(admin, user_id);

    return NextResponse.json(
      {
        success: true,
        user: {
          ...data,
          posts_count,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}