import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
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
    // Runs on sign-in and on every subsequent request that reads the
    // token — this is where instituteId/role actually get embedded into
    // the JWT so they're available without a DB round-trip on every page.
    async jwt({ token, user }) {
      if (user) {
        token.instituteId = user.instituteId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.instituteId = token.instituteId;
      session.user.role = token.role;
      return session;
    },
  },
});
