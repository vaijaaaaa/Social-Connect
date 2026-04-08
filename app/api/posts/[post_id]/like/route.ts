import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{
    post_id: string;
  }>;
};

export async function POST(_: Request, context: Context) {
  try {
    const { user, unauthorized } = await requireAuth();

    if (unauthorized) {
      return unauthorized;
    }

    const { post_id } = await context.params;
    const user_id = user.id;

    const admin = createSupabaseAdminClient();

    const { data: existingLike, error: checkError } = await admin
      .from("likes")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, message: checkError.message },
        { status: 400 },
      );
    }

    if (existingLike) {
      return NextResponse.json(
        { success: false, message: "Already liked this post" },
        { status: 409 },
      );
    }

    const { data: likeData, error: insertError } = await admin
      .from("likes")
      .insert({
        post_id,
        user_id,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 400 },
      );
    }

    const { data: postData } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", post_id)
      .single();

    await admin
      .from("posts")
      .update({ like_count: (postData?.like_count || 0) + 1 })
      .eq("id", post_id);

    return NextResponse.json(
      {
        success: true,
        message: "Post liked successfully",
        like: likeData,
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

export async function DELETE(_: Request, context: Context) {
  try {
    const { user, unauthorized } = await requireAuth();

    if (unauthorized) {
      return unauthorized;
    }

    const { post_id } = await context.params;
    const user_id = user.id;

    const admin = createSupabaseAdminClient();

    const { error: deleteError } = await admin
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", user_id)
      .select("id")
      .single();

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: "Like not found or already removed" },
        { status: 404 },
      );
    }

    const { data: postData } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", post_id)
      .single();

    await admin
      .from("posts")
      .update({ like_count: Math.max((postData?.like_count || 0) - 1, 0) })
      .eq("id", post_id);

    return NextResponse.json(
      {
        success: true,
        message: "Post unliked successfully",
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