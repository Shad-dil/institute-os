import type { NextAuthConfig } from "next-auth";

function isAuthPage(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}

/**
 * This config is intentionally minimal — it's the one that gets bundled
 * into the Edge middleware function. No providers, no Prisma, no bcrypt.
 * Those are Node.js-only dependencies that have no business running at
 * the edge anyway; middleware only needs to answer "is there a valid
 * session," not verify a password against the database.
 *
 * lib/auth.ts (the full config, used everywhere else) spreads this in
 * and adds the real Credentials provider on top.
 */
export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname, origin } = request.nextUrl;
      const authPage = isAuthPage(pathname);

      if (!isLoggedIn && !authPage) {
        const loginUrl = new URL("/login", origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      if (isLoggedIn && authPage) {
        return Response.redirect(new URL("/dashboard", origin));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
