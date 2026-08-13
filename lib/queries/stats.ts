"use client";

import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api/stats";

export const statsKeys = { public: ["stats", "public"] as const };

/**
 * Marketing-page counts. These change slowly, so a long stale time keeps the
 * landing page from hitting the API on every visit — it is the most-viewed
 * page on the site and the numbers do not need to be second-accurate.
 */
export function usePublicStats() {
  return useQuery({
    queryKey: statsKeys.public,
    queryFn: statsApi.publicStats,
    staleTime: 5 * 60 * 1000,
  });
}
