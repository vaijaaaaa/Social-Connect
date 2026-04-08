import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loginSchema } from "@/lib/validations/auth";
import { success } from "zod";

export async function POST(request:Request){
    try {
        const body = await request.json();
        const parsed = loginSchema.safeParse(body);

        if(!parsed.success){
            return NextResponse.json(
                {
                    success:false,
                    message : "Invalid login data",
                    errors : parsed.error.flatten(),
                },
                {status:400},
            );
        }

        const { identifier, password } = parsed.data;
    const admin = createSupabaseAdminClient();

    const { data: profileByEmail } = await admin
      .from("profiles")
      .select(
        "id, email, username, first_name, last_name, bio, avatar_url, website, location, last_login_at, created_at, updated_at",
      )
      .eq("email", identifier)
      .maybeSingle();

      let profile = profileByEmail ?? null;
      let emailToUse = identifier;

       if (!profile) {
      const { data: profileByUsername } = await admin
        .from("profiles")
        .select(
          "id, email, username, first_name, last_name, bio, avatar_url, website, location, last_login_at, created_at, updated_at",
        )
        .eq("username", identifier)
        .maybeSingle();

      profile = profileByUsername ?? null;
      emailToUse = profileByUsername?.email ?? identifier;
    }

    if(!profile){
        return NextResponse.json(
            {success:false,message:"Invalid credentials"},
            {status:401},
        )
    }

     const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    );

      const { data: signInData, error: signInError } =
      await publicClient.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

    if (signInError || !signInData.session || !signInData.user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

await admin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", signInData.user.id);

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: profile,
      },
      { status: 200 },
    );

    response.cookies.set("sb-access-token", signInData.session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    response.cookies.set("sb-refresh-token", signInData.session.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;

    } catch (error) {
        return NextResponse.json(
            {success:false,message:"Internal server error"},
            {status:500},
        );
    }
}