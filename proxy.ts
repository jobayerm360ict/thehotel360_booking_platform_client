import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "bn"] as const;
const DEFAULT_LOCALE = "en";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, Next internal files, APIs, and file extensions
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Check if the pathname already has a supported locale prefix
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 3. If no locale prefix, determine locale from cookie or use default
  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = savedLocale === "bn" || savedLocale === "en" ? savedLocale : DEFAULT_LOCALE;

  const targetPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const redirectUrl = new URL(targetPath, request.url);
  redirectUrl.search = request.nextUrl.search;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
