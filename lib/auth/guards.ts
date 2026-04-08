import { NextResponse } from "next/server";
import { getCurrentAuthUser, type AuthUser } from "@/lib/auth/session";

export type AuthGuardResult =
  | { user: AuthUser; unauthorized: null }
  | { user: null; unauthorized: NextResponse };

export async function requireAuth(): Promise<AuthGuardResult> {
  const user = await getCurrentAuthUser();

  if (!user) {
    return {
      user: null,
      unauthorized: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  return {
    user,
    unauthorized: null,
  };
}