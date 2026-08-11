"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Route-level error boundary — shown instead of a blank page when a client
 * component throws. Next.js passes the error and a reset() to retry.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console and available for an error reporter.
    console.error("Unhandled UI error:", error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-500 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
          That page hit an unexpected error. Trying again usually fixes it — if
          it keeps happening, let us know.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <RotateCw className="w-4 h-4" />Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl ring-1 ring-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-slate-400 mt-5">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
