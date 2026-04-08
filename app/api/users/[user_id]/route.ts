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

    return NextResponse.json(
      {
        success: true,
        user: data,
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