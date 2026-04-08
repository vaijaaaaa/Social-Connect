import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { MAX_POST_CONTENT_LENGTH } from "@/lib/utils/constants";

export async function GET() {
    try {
        const admin = createSupabaseAdminClient();

        const { data, error } = await admin
            .from("posts")
            .select(
                "id, author_id, content, image_url, is_active, like_count, comment_count, created_at, updated_at",
            )
            .eq("is_active", true)
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

export async function POST(request: Request) {
    try {
        const { user, unauthorized } = await requireAuth();

        if (unauthorized) {
            return unauthorized;
        }

        const body = await request.json();
        const { content, image_url } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, message: "content is required" },
                { status: 400 },
            );
        }

        if (typeof content !== "string" || content.length > MAX_POST_CONTENT_LENGTH) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Content must be at most ${MAX_POST_CONTENT_LENGTH} characters`,
                },
                { status: 400 },
            );
        }

        const admin = createSupabaseAdminClient();

        const { data, error } = await admin
            .from("posts")
            .insert({
                author_id: user.id,
                content,
                image_url: image_url || null,
                is_active: true,
                like_count: 0,
                comment_count: 0,
            })
            .select(
                "id, author_id, content, image_url, is_active, like_count, comment_count, created_at, updated_at",
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
                message: "Post created successfully",
                post: data,
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