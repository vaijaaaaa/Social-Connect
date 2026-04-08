import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select(
        "id, email, username, first_name, last_name, bio, avatar_url, website, location, last_login_at, created_at, updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
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

export async function PATCH(request: Request) {
  try {
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
      .select(
        "id, email, username, first_name, last_name, bio, avatar_url, website, location, last_login_at, created_at, updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
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