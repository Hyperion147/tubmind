import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { updateSession } from "@/lib/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const code = request.nextUrl.searchParams.get("code");

  if (code && pathname !== "/auth/callback") {
    const callbackUrl = new URL("/auth/callback", request.url);
    const nextParams = new URLSearchParams(request.nextUrl.searchParams);

    nextParams.delete("code");

    const nextPath = `${pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`;

    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("next", nextPath);

    return NextResponse.redirect(callbackUrl);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
