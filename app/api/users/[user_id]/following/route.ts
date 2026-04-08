import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
      .from("follows")
      .select(
        `
        id,
        following_id,
        created_at,
        following:profiles!follows_following_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
        `,
      )
      .eq("follower_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        following: data,
        count: data?.length || 0,
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