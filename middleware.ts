import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Using the lightweight config here, NOT @/lib/auth — that's the whole
// fix. This keeps Prisma and bcrypt out of the Edge Function bundle.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
