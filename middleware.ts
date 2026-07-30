import { NextRequest, NextResponse } from "next/server";

import { PRODUCTION_ORIGIN } from "./config/site";

export function middleware(request: NextRequest) {
  const productionHostname = new URL(PRODUCTION_ORIGIN).hostname;
  const requestProtocol = request.nextUrl.protocol.replace(":", "");
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";

  if (
    isProduction &&
    request.nextUrl.hostname === productionHostname &&
    requestProtocol === "http"
  ) {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = "https";
    return NextResponse.redirect(secureUrl, 308);
  }

  const response = NextResponse.next();
  if (process.env.VERCEL_ENV === "preview") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
