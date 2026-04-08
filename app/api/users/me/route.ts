import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/guards";

const profileSelect =
  "id, email, username, first_name, last_name, bio, avatar_url, website, location, last_login_at, created_at, updated_at";

export async function GET() {
  try {
    const { user, unauthorized } = await requireAuth();

    if (unauthorized) {
      return unauthorized;
    }

    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select(profileSelect)
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 },
      );
    }

    const { count } = await admin
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("is_active", true);

    return NextResponse.json(
      {
        success: true,
        user: {
          ...data,
          posts_count: count ?? 0,
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

export async function PATCH(request: Request) {
  try {
    const { user, unauthorized } = await requireAuth();

    if (unauthorized) {
      return unauthorized;
    }

    const body = await request.json();
    const admin = createSupabaseAdminClient();

    const updateData: Record<string, string | null> = {};

    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;

    const { data, error } = await admin
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select(profileSelect)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Profile update failed" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
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