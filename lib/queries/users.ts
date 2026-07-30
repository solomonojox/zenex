"use client";

import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";

export const userKeys = {
  me: ["me"] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: usersApi.me,
    enabled,
  });
}
