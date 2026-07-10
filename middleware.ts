import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

function isAuthPage(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}

function hasAuthCookie(req: NextRequest) {
  return AUTH_COOKIE_NAMES.some((cookieName) =>
    Boolean(req.cookies.get(cookieName)),
  );
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const authPage = isAuthPage(pathname);
  const isLoggedIn = hasAuthCookie(req);

  if (!isLoggedIn && !authPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && authPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except the auth API routes and static assets goes through
  // the check above. /login and /signup ARE matched so the redirect logic
  // can still run for those pages.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
