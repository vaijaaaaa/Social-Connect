import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{
    user_id: string;
  }>;
};

export async function POST(request: Request, context: Context) {
  try {
    const { user_id: following_id } = await context.params;
    const body = await request.json();
    const { follower_id } = body;

    if (!follower_id) {
      return NextResponse.json(
        { success: false, message: "follower_id is required" },
        { status: 400 },
      );
    }

    if (follower_id === following_id) {
      return NextResponse.json(
        { success: false, message: "You cannot follow yourself" },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();

    const { data: existingFollow } = await admin
      .from("follows")
      .select("id")
      .eq("follower_id", follower_id)
      .eq("following_id", following_id)
      .maybeSingle();

    if (existingFollow) {
      return NextResponse.json(
        { success: false, message: "Already following this user" },
        { status: 409 },
      );
    }

    const { data, error } = await admin
      .from("follows")
      .insert({
        follower_id,
        following_id,
      })
      .select("id, follower_id, following_id, created_at")
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
        message: "User followed successfully",
        follow: data,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { user_id: following_id } = await context.params;
    const body = await request.json();
    const { follower_id } = body;

    if (!follower_id) {
      return NextResponse.json(
        { success: false, message: "follower_id is required" },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();

    const { error } = await admin
      .from("follows")
      .delete()
      .eq("follower_id", follower_id)
      .eq("following_id", following_id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User unfollowed successfully",
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