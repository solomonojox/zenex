"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { useForgotPassword } from "@/lib/queries/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, data, error } = useForgotPassword();

  const submit = () => {
    if (email.trim()) mutate(email.trim());
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-7 h-7 text-teal-600" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Check your email</h2>
        <p className="text-sm text-slate-500 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
          {data?.message ?? "If that email is registered, a reset link is on its way."}
        </p>
        <Link href="/auth?mode=login" className="text-teal-600 font-bold text-sm hover:text-teal-700">
          ← Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-7">
        <h2 className="text-2xl font-extrabold text-slate-900">Forgot your password?</h2>
        <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <label className="text-xs font-bold text-slate-700 mb-1.5 block">Email address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="you@email.com"
        className="w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800 mb-4"
        style={{ fontFamily: "'Inter', sans-serif" }}
      />

      {error && <p className="text-xs text-red-600 font-semibold mb-3">{(error as Error).message}</p>}

      <button
        onClick={submit}
        disabled={isPending || !email.trim()}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm"
      >
        {isPending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-xs text-slate-500 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        Remembered it? <Link href="/auth?mode=login" className="text-teal-600 font-bold">Sign in</Link>
      </p>
    </Card>
  );
}
