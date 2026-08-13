"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";
import Card from "@/components/ui/Card";
import { useLogin } from "@/lib/queries/auth";
import { homeFor } from "@/components/auth/RouteGuard";

export default function LoginForm() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();

  const submit = () => {
    login(
      { email, password },
      {
        onSuccess: (tokens) => {
          const { role } = jwtDecode<{ role: string }>(tokens.accessToken);
          // Return the user to wherever they were headed before the guard
          // intercepted them; otherwise send them to their own dashboard.
          // Only relative paths are honoured, so this can't be used to
          // redirect someone off-site.
          const returnTo = searchParams.get("returnTo");
          const safe =
            returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
              ? returnTo
              : null;
          router.push(safe ?? homeFor(role));
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-7">
        <h2 className="text-2xl font-extrabold text-slate-900">Welcome back</h2>
        <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Sign in to your Zenex account</p>
      </div>
      <div className="space-y-2.5 mb-6">
        {[{ label: "Continue with Google", bg: "bg-white ring-1 ring-slate-200 hover:bg-slate-50", emoji: "🔵" },
          { label: "Continue with Apple", bg: "bg-slate-900 text-white hover:bg-slate-800", emoji: "🍎" }].map((b) => (
          <button key={b.label} className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-colors ${b.bg} text-slate-800`}>
            <span>{b.emoji}</span> {b.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-slate-100" /><span className="text-xs text-slate-400 font-medium">or</span><div className="flex-1 h-px bg-slate-100" /></div>
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block">Email address</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="you@email.com" className="w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block">Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••" className="w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none pr-10 transition-all text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }} />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
        </div>
        {error && <p className="text-xs text-red-600 font-semibold">{(error as Error).message}</p>}
        <div className="text-right"><Link href="/auth?mode=forgot" className="text-xs text-teal-600 font-bold hover:text-teal-700">Forgot password?</Link></div>
      </div>
      <button onClick={submit} disabled={isPending} className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm mb-4">{isPending ? "Signing in…" : "Sign In"}</button>
      <p className="text-center text-xs text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>
        New to Zenex? <Link href="/auth" className="text-teal-600 font-bold hover:text-teal-700">Create account</Link>
      </p>
    </Card>
  );
}
