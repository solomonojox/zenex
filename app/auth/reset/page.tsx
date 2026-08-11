"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { useResetPassword } from "@/lib/queries/auth";

function ResetContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate, isPending, isSuccess, error } = useResetPassword();

  const submit = () => {
    setLocalError(null);
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords don't match.");
      return;
    }
    mutate({ token, password });
  };

  const input =
    "w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800";

  if (!token) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Invalid reset link</h2>
        <p className="text-sm text-slate-500 mb-6">This link is missing its token — please request a new one.</p>
        <Link href="/auth?mode=forgot" className="text-teal-600 font-bold text-sm">Request a new link</Link>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Password updated</h2>
        <p className="text-sm text-slate-500 mb-6">You can now sign in with your new password.</p>
        <button
          onClick={() => router.push("/auth?mode=login")}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          Go to sign in
        </button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-7">
        <h2 className="text-2xl font-extrabold text-slate-900">Choose a new password</h2>
        <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Must be at least 8 characters.
        </p>
      </div>

      <label className="text-xs font-bold text-slate-700 mb-1.5 block">New password</label>
      <div className="relative mb-3">
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${input} pr-10`}
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <label className="text-xs font-bold text-slate-700 mb-1.5 block">Confirm password</label>
      <input
        type={show ? "text" : "password"}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className={`${input} mb-4`}
        placeholder="••••••••"
      />

      {(localError || error) && (
        <p className="text-xs text-red-600 font-semibold mb-3">
          {localError ?? (error as Error).message}
        </p>
      )}

      <button
        onClick={submit}
        disabled={isPending}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm"
      >
        {isPending ? "Updating…" : "Update password"}
      </button>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Suspense fallback={null}>
        <ResetContent />
      </Suspense>
    </div>
  );
}
