"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth/useAuth";

export type AppRole = "CLIENT" | "PROVIDER" | "ADMIN";

/** Where each role belongs when they land somewhere they shouldn't. */
export function homeFor(role?: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") return "/provider";
  return "/client";
}

/**
 * Single gate for every protected page.
 *
 * Guarantees three things the previous per-page checks did not:
 *  1. Protected content is never rendered before the check resolves — no flash
 *     of another role's dashboard.
 *  2. Role rules are declared in one place, so pages can't drift apart.
 *  3. The intended destination survives the login round-trip via `returnTo`.
 *
 * This is a UX layer, not a security boundary — the API enforces roles on
 * every request regardless of what the browser does.
 */
export default function RouteGuard({
  roles,
  children,
}: {
  /** Omit to require only that the user is signed in. */
  roles?: AppRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading, user } = useAuth();

  const roleAllowed = !roles || (!!user?.role && roles.includes(user.role as AppRole));

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      // Read the query from the browser rather than useSearchParams(): that
      // hook forces every page using this guard out of static generation
      // unless individually wrapped in Suspense. This runs client-side only,
      // so window is always available here.
      const query =
        typeof window !== "undefined" ? window.location.search : "";
      const returnTo = encodeURIComponent(pathname + query);
      router.replace(`/auth?mode=login&returnTo=${returnTo}`);
      return;
    }

    // Signed in, wrong area — send them to their own dashboard.
    if (user?.role && !roleAllowed) {
      router.replace(homeFor(user.role));
    }
  }, [authLoading, isAuthenticated, user, roleAllowed, pathname, router]);

  // Waiting on the session, or about to redirect — show a placeholder rather
  // than the page, so protected data never appears even for a frame.
  if (authLoading || !isAuthenticated || !roleAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        <span className="sr-only">Checking your access…</span>
      </div>
    );
  }

  return <>{children}</>;
}
