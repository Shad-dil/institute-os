import { auth } from "@/lib/auth";

/**
 * Every query and action across the app calls this to scope data to the
 * right tenant. Previously this grabbed whichever Institute row happened
 * to exist first in the DB — a placeholder that only worked because
 * there was exactly one institute in development.
 *
 * Now it reads instituteId out of the authenticated session. Middleware
 * already blocks unauthenticated requests to every page, so this should
 * rarely throw in practice — but it's a real safety net, not just a
 * type-checker satisfier, for any code path middleware doesn't cover
 * (e.g. a route handler outside the matcher).
 */
export async function getCurrentInstituteId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.instituteId) {
    throw new Error("Not authenticated — no institute in session.");
  }

  return session.user.instituteId;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
