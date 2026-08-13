"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import Card from "@/components/ui/Card";
import VBadge from "@/components/ui/VBadge";
import { useMe } from "@/lib/queries/users";
import { useUpdateMyProvider } from "@/lib/queries/providers";

export default function ProfileTab() {
  const { data: me } = useMe();
  const pp = me?.providerProfile;
  const update = useUpdateMyProvider();

  const [form, setForm] = useState({
    title: "",
    location: "",
    bio: "",
    hourlyRate: 0,
    languages: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pp) {
      setForm({
        title: pp.title || "",
        location: pp.location || "",
        bio: pp.bio || "",
        hourlyRate: pp.hourlyRate || 0,
        languages: (pp.languages || []).join(", "),
      });
    }
  }, [pp]);

  const name = me ? `${me.firstName} ${me.lastName}`.trim() : "Provider";
  const image =
    pp?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff&size=160`;

  const save = () => {
    update.mutate(
      {
        title: form.title,
        location: form.location,
        bio: form.bio,
        hourlyRate: Number(form.hourlyRate) || 0,
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); } },
    );
  };

  const field = "w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800";

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-5 mb-5 pb-5 border-b border-slate-100">
          <div className="relative">
            <img src={image} alt={name} className="w-20 h-20 rounded-xl object-cover" />
            <button className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-1.5 shadow-sm"><Camera className="w-3 h-3" /></button>
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{name}</h4>
            <p className="text-sm text-slate-500">{me?.email}</p>
            <div className="flex gap-2 mt-2">
              {pp?.verified && <VBadge />}
              {pp?.elite && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-0.5 rounded-full">Top Pro</span>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} placeholder="e.g. Home Cleaning Specialist" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={field} placeholder="Toronto, ON" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Hourly rate ($)</label>
              <input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} className={field} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Languages (comma-separated)</label>
            <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className={field} placeholder="English, French" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className={field} placeholder="Tell clients about your experience…" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={update.isPending} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {update.isPending ? "Saving…" : "Save changes"}
            </button>
            {saved && <span className="text-sm text-emerald-600 font-semibold">Saved ✓</span>}
            {update.isError && <span className="text-sm text-red-600 font-semibold">{(update.error as Error).message}</span>}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4">Performance</h3>
        {/* "Response" dropped — responseTime is a seeded string nobody
            measures or can edit, so it told the provider nothing true. */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-extrabold text-teal-600">
              {(pp?.reviewsCount ?? 0) > 0 ? (pp?.rating ?? 0).toFixed(2) : "—"}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Rating ({pp?.reviewsCount ?? 0})</div>
          </div>
          <div><div className="text-xl font-extrabold text-teal-600">{pp?.completions ?? 0}</div><div className="text-xs text-slate-400 mt-0.5">Jobs done</div></div>
          <div><div className="text-xl font-extrabold text-teal-600">{pp?.verified ? "Yes" : "No"}</div><div className="text-xs text-slate-400 mt-0.5">Verified</div></div>
        </div>
      </Card>
    </div>
  );
}
