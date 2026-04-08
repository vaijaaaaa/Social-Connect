import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{
    post_id: string;
  }>;
};

export async function POST(request: Request, context: Context) {
  try {
    const { post_id } = await context.params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "user_id is required" },
        { status: 400 },
      );
    }

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

    const { error: updateError } = await admin
      .from("posts")
      .update({ like_count: admin.rpc("increment_like_count", { post_id }) })
      .eq("id", post_id);

    if (!updateError) {
      await admin.rpc("increment_like_count", { post_id });
    }

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
    const { post_id } = await context.params;
    const admin = createSupabaseAdminClient();

    const { data: likeData, error: deleteError } = await admin
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .select("id")
      .single();

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: "Like not found or already removed" },
        { status: 404 },
      );
    }

    await admin
      .from("posts")
      .update({ like_count: admin.rpc("decrement_like_count", { post_id }) })
      .eq("id", post_id);

    if (likeData) {
      await admin.rpc("decrement_like_count", { post_id });
    }

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