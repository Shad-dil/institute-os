import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/action/logout-action";

interface LogoutButtonProps {
  showLabel?: boolean;
}

/**
 * No "use client" needed — this is a plain HTML form posting to a Server
 * Action, which works even with JavaScript disabled. Simpler and more
 * robust than wiring an onClick handler that calls signOut() client-side.
 */
export function LogoutButton({ showLabel = false }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-slate-500 hover:text-red-600">
        <LogOut className="h-3.5 w-3.5" />
        {showLabel && "Log out"}
      </Button>
    </form>
  );
}
