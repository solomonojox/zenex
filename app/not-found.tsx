import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="text-center max-w-md">
        <div className="text-5xl font-extrabold text-teal-600 mb-2">404</div>
        <h1 className="text-xl font-extrabold text-slate-900 mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-500 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
          That page doesn&apos;t exist or may have moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Search className="w-4 h-4" />Find a cleaner
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ring-1 ring-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />Home
          </Link>
        </div>
      </div>
    </div>
  );
}
