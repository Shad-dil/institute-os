import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

function isAuthPage(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const authPage = isAuthPage(pathname);
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !authPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && authPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Everything except the auth API routes and static assets goes through
  // the check above. /login and /signup ARE matched so the redirect logic
  // can still run for those pages (e.g. bouncing an already-logged-in
  // user away from /login).
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
