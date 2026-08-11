"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { SERVICE_CATS } from "@/lib/data";
import type { Role } from "./types";
import { useRegister } from "@/lib/queries/auth";
import DocumentUploader, {
  type StagedDoc,
} from "@/components/verification/DocumentUploader";
import { useSubmitVerification } from "@/lib/queries/verifications";

const PROVIDER_STEPS = ["Basic Info", "Verification", "Services", "Pricing", "Done"];
const VERIFY_STEP = 1;

export default function SignupForm({ role }: { role: Role }) {
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  // Basic-info fields (shared by both roles).
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Verification step — optional at signup, completable later in the dashboard.
  const [docs, setDocs] = useState<StagedDoc[]>([]);
  const [skippedVerification, setSkippedVerification] = useState(false);

  const { mutate: register, isPending, error } = useRegister();
  const submitVerification = useSubmitVerification();

  const advance = () => setStep((s) => s + 1);

  const goNext = () => {
    if (role === "client") {
      register(
        { firstName, lastName, email, phone, password, role: "CLIENT" },
        { onSuccess: () => router.push("/client") },
      );
      return;
    }

    // Provider: the account is created when leaving Basic Info, so the user is
    // authenticated for the rest of the wizard (uploads need a token).
    if (step === 0) {
      register(
        { firstName, lastName, email, phone, password, role: "PROVIDER" },
        { onSuccess: () => setStep(1) },
      );
      return;
    }

    // Verification step: submit whatever was uploaded, then continue.
    if (step === VERIFY_STEP && docs.length > 0) {
      submitVerification.mutate(
        {
          documents: docs.map(({ type, url, expiresAt }) => ({ type, url, expiresAt })),
        },
        { onSuccess: advance },
      );
      return;
    }

    if (step < PROVIDER_STEPS.length - 1) {
      advance();
    } else {
      router.push("/provider");
    }
  };

  const skipVerification = () => {
    setSkippedVerification(true);
    setDocs([]);
    advance();
  };

  const inputClass =
    "w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all";

  return (
    <Card className="w-full max-w-lg p-8">
      {role === "provider" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-600">Step {step + 1} of {PROVIDER_STEPS.length}</span>
            <span className="text-xs text-slate-400">{PROVIDER_STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${((step + 1) / PROVIDER_STEPS.length) * 100}%` }} /></div>
        </div>
      )}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-extrabold text-slate-900">{role === "client" ? "Create your account" : PROVIDER_STEPS[step]}</h2>
        <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>{role === "client" ? "Book your first clean today" : "Set up your provider profile"}</p>
      </div>

      {(role === "client" || step === 0) && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Alexandra" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Park" className={inputClass} />
            </div>
          </div>
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (416) 555-0182" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
          </div>
        </>
      )}

      {role === "provider" && step === VERIFY_STEP && (
        <div className="space-y-4 mb-6">
          <div className="rounded-xl p-3.5 bg-teal-50/60 ring-1 ring-teal-100 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Verified pros get a badge and rank higher in search. You can upload
              now or finish this later from your dashboard — it won&apos;t block you
              from setting up your profile.
            </p>
          </div>

          <DocumentUploader staged={docs} onChange={setDocs} />

          {submitVerification.isError && (
            <p className="text-xs text-red-600 font-semibold">
              {(submitVerification.error as Error).message}
            </p>
          )}
        </div>
      )}

      {role === "provider" && step === 2 && (
        <div className="space-y-2 mb-6">
          {SERVICE_CATS.map(({ Icon, label }) => (
            <label key={label} className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer hover:bg-teal-50 group ring-1 ring-transparent hover:ring-teal-200 transition-all">
              <input type="checkbox" className="accent-teal-600 w-4 h-4" defaultChecked={["Home Clean", "Deep Clean"].includes(label)} />
              <Icon className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="font-semibold text-sm text-slate-800">{label}</span>
            </label>
          ))}
        </div>
      )}

      {role === "provider" && step === 3 && (
        <div className="space-y-4 mb-6">
          {[["Hourly rate", "$", "45"], ["Minimum booking (hrs)", "", "2"], ["Maximum radius (km)", "", "25"]].map(([l, prefix, v]) => (
            <div key={l}>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">{l}</label>
              <div className="relative">
                <input defaultValue={v} className={`${inputClass} pl-8`} />
                {prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">{prefix}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {role === "provider" && step === 4 && (
        <div className="text-center py-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200"><CheckCircle className="w-8 h-8 text-white" /></div>
          <h3 className="font-extrabold text-lg text-slate-900 mb-1">You&apos;re all set!</h3>
          <p className="text-sm text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>
            {skippedVerification
              ? "Your account is ready. Complete verification any time from the Verification tab to earn your badge."
              : "Your documents are under review — we'll notify you within 24 hours."}
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-semibold mb-3">{(error as Error).message}</p>}

      <button
        onClick={goNext}
        disabled={isPending || submitVerification.isPending}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-sm shadow-teal-200"
      >
        {isPending || submitVerification.isPending
          ? "Please wait…"
          : role === "provider"
            ? step === 4
              ? "Go to Dashboard"
              : step === VERIFY_STEP && docs.length > 0
                ? `Submit ${docs.length} document${docs.length === 1 ? "" : "s"}`
                : "Continue"
            : "Create Account"}
      </button>

      {/* Verification is optional at signup so early adopters aren't blocked. */}
      {role === "provider" && step === VERIFY_STEP && (
        <button
          onClick={skipVerification}
          disabled={submitVerification.isPending}
          className="w-full mt-2.5 text-slate-500 hover:text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          Skip for now — I&apos;ll do this later
        </button>
      )}

      {role !== "provider" && (
        <p className="text-center text-xs text-slate-500 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          Already have an account? <Link href="/auth?mode=login" className="text-teal-600 font-bold">Sign in</Link>
        </p>
      )}
    </Card>
  );
}
