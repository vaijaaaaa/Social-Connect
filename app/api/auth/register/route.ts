import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration data",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { email, username, password, first_name, last_name } = parsed.data;
    const admin = createSupabaseAdminClient();

    const { data: existingEmail } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 },
      );
    }

    const { data: existingUsername } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 409 },
      );
    }

    const { data: authUser, error: createUserError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          first_name,
          last_name,
        },
      });

    if (createUserError || !authUser?.user) {
      return NextResponse.json(
        {
          success: false,
          message: createUserError?.message || "Failed to create user",
        },
        { status: 400 },
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: authUser.user.id,
      email,
      username,
      first_name,
      last_name,
      bio: null,
      avatar_url: null,
      website: null,
      location: null,
      last_login_at: null,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { success: false, message: profileError.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: authUser.user.id,
          email,
          username,
          first_name,
          last_name,
        },
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