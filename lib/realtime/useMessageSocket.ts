"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { messageKeys } from "@/lib/queries/messages";

// Strip the trailing "/api" from the REST base to get the socket host.
const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(
  /\/api\/?$/,
  "",
);

/**
 * Connects to the /messages Socket.IO namespace, joins the active thread's
 * room, and refreshes the relevant queries when a new message arrives.
 */
export function useMessageSocket(threadId?: string) {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("zenexUserToken") : null;
    if (!token) return;

    const socket = io(`${WS_BASE}/messages`, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("message:new", (msg: { threadId: string }) => {
      qc.invalidateQueries({ queryKey: messageKeys.thread(msg.threadId) });
      qc.invalidateQueries({ queryKey: messageKeys.threads });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [qc]);

  useEffect(() => {
    if (threadId && socketRef.current) {
      socketRef.current.emit("thread:join", { threadId });
    }
  }, [threadId]);
}
