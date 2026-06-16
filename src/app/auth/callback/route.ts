import { NextRequest, NextResponse } from "next/server";

import { syncProfileForUser } from "@/lib/auth";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const redirectUrl = new URL(next, request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    const supabase = createSupabaseRouteClient(request, response);
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await syncProfileForUser(user);
    }
  }

  return response;
}
