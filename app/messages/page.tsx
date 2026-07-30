"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth/useAuth";
import {
  useThreads,
  useThreadMessages,
  useSendMessage,
  useCreateThread,
} from "@/lib/queries/messages";
import { useMessageSocket } from "@/lib/realtime/useMessageSocket";
import ThreadList from "@/components/messages/ThreadList";
import ChatWindow from "@/components/messages/ChatWindow";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, authLoading, user } = useAuth();

  // ?thread=<counterpartId> means "open a conversation with this person"
  // (a provider id when you're a client, or a client id when you're a provider).
  const counterpartParam = searchParams.get("thread");

  const { data: threads = [], isLoading: threadsLoading } = useThreads(isAuthenticated);
  const [activeId, setActiveId] = useState<string | null>(null);
  const createThread = useCreateThread();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/auth?mode=login");
  }, [authLoading, isAuthenticated, router]);

  // Resolve the counterpart param to an actual thread (existing or new).
  useEffect(() => {
    if (handledRef.current || !isAuthenticated) return;
    if (counterpartParam) {
      const existing = threads.find(
        (t) =>
          t.providerId === counterpartParam ||
          t.clientId === counterpartParam ||
          t.counterpart?.id === counterpartParam,
      );
      if (existing) {
        setActiveId(existing.id);
        handledRef.current = true;
      } else if (!createThread.isPending) {
        createThread.mutate(counterpartParam, {
          onSuccess: (t) => {
            setActiveId(t.id);
            handledRef.current = true;
          },
        });
      }
    } else if (threads.length) {
      setActiveId((cur) => cur ?? threads[0].id);
      handledRef.current = true;
    }
  }, [counterpartParam, threads, isAuthenticated, createThread]);

  const { data: messages = [], isLoading: msgsLoading } = useThreadMessages(
    activeId ?? undefined,
  );
  const send = useSendMessage();
  useMessageSocket(activeId ?? undefined);

  const activeThread = threads.find((t) => t.id === activeId) ?? null;

  const handleSend = (text: string) => {
    if (activeId) send.mutate({ threadId: activeId, body: text });
  };

  return (
    <>
      <ThreadList threads={threads} activeId={activeId} onSelect={setActiveId} loading={threadsLoading} />
      <ChatWindow
        thread={activeThread}
        messages={messages}
        myId={user?.id}
        onSend={handleSend}
        sending={send.isPending}
        loading={msgsLoading && !!activeId}
      />
    </>
  );
}

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-[#F8FAFB] flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Suspense fallback={null}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
