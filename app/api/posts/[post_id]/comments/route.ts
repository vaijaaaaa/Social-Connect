import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{
    post_id: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  try {
    const { post_id } = await context.params;
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("comments")
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        updated_at,
        profiles:user_id(id, username, avatar_url)
        `,
      )
      .eq("post_id", post_id)
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
        comments: data,
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

export async function POST(request: Request, context: Context) {
  try {
    const { user, unauthorized } = await requireAuth();

    if (unauthorized) {
      return unauthorized;
    }

    const { post_id } = await context.params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, message: "content is required" },
        { status: 400 },
      );
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Content cannot be empty" },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();

    const { data: commentData, error: insertError } = await admin
      .from("comments")
      .insert({
        post_id,
        user_id: user.id,
        content,
      })
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        updated_at,
        profiles:user_id(id, username, avatar_url)
        `,
      )
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 400 },
      );
    }

    const { data: postData } = await admin
      .from("posts")
      .select("comment_count")
      .eq("id", post_id)
      .single();

    await admin
      .from("posts")
      .update({ comment_count: (postData?.comment_count || 0) + 1 })
      .eq("id", post_id);

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        comment: commentData,
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