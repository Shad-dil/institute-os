import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/queries/institute";
import { logoutAction } from "@/lib/action/logout-action";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Server Component — fetches the real logged-in user instead of the
 * hardcoded "Ravi Kumar / Administrator" placeholder from the original
 * navbar. Drop this in wherever that placeholder currently lives.
 */
export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-blue-600 text-sm font-medium text-white">
          {initials(user.name ?? "")}
        </AvatarFallback>
      </Avatar>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500">
          {user.role === "OWNER" ? "Administrator" : "Staff"}
        </p>
      </div>
      <form action={logoutAction}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="gap-1.5 text-slate-500"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
