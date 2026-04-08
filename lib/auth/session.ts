import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../supabase/server";

export type AuthUser = {
    id : string,
    email : string | null;
}

export async function getCurrentAuthUser() : Promise<AuthUser | null>{
    const supabase = await createSupabaseServerClient();

    const {data,error} = await supabase.auth.getUser();

        if(!error && data.user){
                return {
                        id : data.user.id,
                        email : data.user.email ?? null,
                };
    }

        // Fallback for custom auth cookies set by /api/auth/login.
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("sb-access-token")?.value;

        if (!accessToken) {
            return null;
        }

        const supabaseWithToken = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        );

        const { data: tokenData, error: tokenError } =
            await supabaseWithToken.auth.getUser(accessToken);

        if (tokenError || !tokenData.user) {
            return null;
        }

        return {
                id : tokenData.user.id,
                email : tokenData.user.email ?? null,
    }
}