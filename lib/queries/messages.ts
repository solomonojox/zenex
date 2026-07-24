"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";

export const messageKeys = {
  threads: ["messages", "threads"] as const,
  thread: (id: string) => ["messages", "thread", id] as const,
};

export function useThreads(enabled = true) {
  return useQuery({
    queryKey: messageKeys.threads,
    queryFn: messagesApi.threads,
    enabled,
  });
}

export function useThreadMessages(threadId?: string) {
  return useQuery({
    queryKey: messageKeys.thread(threadId || ""),
    queryFn: () => messagesApi.messages(threadId as string),
    enabled: !!threadId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) =>
      messagesApi.send(threadId, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: messageKeys.thread(vars.threadId) });
      qc.invalidateQueries({ queryKey: messageKeys.threads });
    },
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (counterpartId: string) => messagesApi.createThread(counterpartId),
    onSuccess: () => qc.invalidateQueries({ queryKey: messageKeys.threads }),
  });
}
