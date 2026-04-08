import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { user, unauthorized } = await requireAuth();

    if (unauthorized) {
      return unauthorized;
    }

    const admin = createSupabaseAdminClient();

    const { data: followingRows, error: followingError } = await admin
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (followingError) {
      return NextResponse.json(
        { success: false, message: followingError.message },
        { status: 400 },
      );
    }

    const followingIds = Array.isArray(followingRows)
      ? followingRows.map((item) => item.following_id).filter((id): id is string => Boolean(id))
      : [];

    let query = admin
      .from("posts")
      .select(
        `
        id,
        author_id,
        content,
        image_url,
        is_active,
        like_count,
        comment_count,
        created_at,
        updated_at,
        profiles:author_id(id, username, first_name, last_name, avatar_url)
        `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (followingIds.length > 0) {
      const authorIds = Array.from(new Set([user.id, ...followingIds]));
      query = query.in("author_id", authorIds);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        posts: data,
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