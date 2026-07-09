import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      instituteId: string;
      role: "OWNER" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    instituteId: string;
    role: "OWNER" | "STAFF";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    instituteId: string;
    role: "OWNER" | "STAFF";
  }
}
