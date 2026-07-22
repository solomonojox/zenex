import type { ReactNode } from "react";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.06] ${className}`}>
      {children}
    </div>
  );
}
