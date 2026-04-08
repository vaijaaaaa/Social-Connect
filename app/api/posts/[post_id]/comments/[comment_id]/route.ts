import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{
    post_id: string;
    comment_id: string;
  }>;
};

export async function DELETE(_: Request, context: Context) {
  try {
    const { post_id, comment_id } = await context.params;
    const admin = createSupabaseAdminClient();

    const { data: commentData, error: deleteError } = await admin
      .from("comments")
      .delete()
      .eq("id", comment_id)
      .eq("post_id", post_id)
      .select("id")
      .single();

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: "Comment not found or already deleted" },
        { status: 404 },
      );
    }

    const { data: postData } = await admin
      .from("posts")
      .select("comment_count")
      .eq("id", post_id)
      .single();

    await admin
      .from("posts")
      .update({ 
        comment_count: Math.max((postData?.comment_count || 0) - 1, 0) 
      })
      .eq("id", post_id);

    return NextResponse.json(
      {
        success: true,
        message: "Comment deleted successfully",
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