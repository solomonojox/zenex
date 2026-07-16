"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MESSAGES } from "@/lib/data";
import ThreadList from "@/components/messages/ThreadList";
import ChatWindow from "@/components/messages/ChatWindow";

function MessagesContent() {
  const searchParams = useSearchParams();
  const threadParam = Number(searchParams.get("thread"));
  const initialId = MESSAGES.some((m) => m.id === threadParam) ? threadParam : MESSAGES[0].id;

  const [threads, setThreads] = useState(MESSAGES);
  const [activeId, setActiveId] = useState(initialId);
  const active = threads.find((m) => m.id === activeId) ?? threads[0];

  const handleSend = (text: string) => {
    setThreads((t) => t.map((m) => (m.id === activeId ? { ...m, thread: [...m.thread, { from: "user" as const, text, time: "Just now" }] } : m)));
  };

  return (
    <>
      <ThreadList threads={threads} activeId={activeId} onSelect={setActiveId} />
      <ChatWindow thread={active} onSend={handleSend} />
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
