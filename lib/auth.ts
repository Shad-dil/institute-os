import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          instituteId: user.instituteId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // authConfig only defines `authorized` (middleware-only) — spreading
    // it here keeps that intact while adding jwt/session, which only the
    // full config needs.
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.instituteId = user.instituteId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.instituteId = token.instituteId as string;
      session.user.role = token.role as "OWNER" | "STAFF";
      return session;
    },
  },
});
