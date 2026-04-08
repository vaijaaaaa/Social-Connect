import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { success } from "zod";
import { Erica_One } from "next/font/google";

type Context = {
    params:Promise<{
        post_id : string;
    }>;
};

export async function GET(_:Request,context:Context){
    try {
        const {post_id} = await context.params;
        const admin = createSupabaseAdminClient();

        const{data,error} = await admin
            .from("posts")
            .select(
                "id, author_id, content, image_url, is_active, like_count, comment_count, created_at, updated_at",
            )
            .single();

        if(error){
            return NextResponse.json(
                {success:false,message:error.message},
                {status:400},
            );
        }

        return NextResponse.json(
            {
                success:true,
                message:"Posts updated successfully",
                post:data,
            },{
                status:200
            },
        );

    } catch  {
        return NextResponse.json(
            {success:false,message:"Internal servere error"},
            {status:500},
        );
    }
}

export async function DELETE(_:Request,content:Context){
    try {
        const {post_id} = await content.params;
        const admin = createSupabaseAdminClient();

        const {error} = await admin.from("posts").delete().eq("id",post_id);

        if(error){
            return NextResponse.json(
                {success:false,message:error.message},
                {status:400},
            )
        }
        return NextResponse.json(
            {
                success:true,
                message:"Post deleted successfully",
            },
            {status:200},
        )


    } catch  {
        return NextResponse.json(
            {success:false,message:"Internal server error"},
            {status:500},
        )
    }
}