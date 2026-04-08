import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { success } from "zod";

export async function GET(){
    try {
        const admin = createSupabaseAdminClient();

         const { data, error } = await admin
      .from("posts")
      .select(
        `
        id,
        author_id,
        content,
        image_url,
        is_active,
        like_count,
        comment_count,
        created_at,
        updated_at,
        profiles:author_id(id, username, first_name, last_name, avatar_url)
        `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

      if(error){
        return NextResponse.json(
            {success:false,message :error.message},
            {status:400},
        )
      }

      return NextResponse.json({
        success:true,
        posts:data,
      },
    {status:200},
);

    } catch {
        return NextResponse.json(
            {success:false,message:"Internal server error"},
            {status:500},
        );
    }
}