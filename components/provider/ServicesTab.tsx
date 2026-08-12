"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Clock, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import {
  useMyServices,
  useCreateMyService,
  useUpdateMyService,
  useDeleteMyService,
} from "@/lib/queries/providers";
import type { ServiceInput } from "@/lib/api/providers";

const EMPTY: ServiceInput = { name: "", description: "", duration: "", price: 0 };

const SUGGESTIONS = [
  { name: "Standard Clean", duration: "2–3 hrs", price: 90, description: "Kitchen, bathrooms, bedrooms and living areas" },
  { name: "Deep Clean", duration: "4–6 hrs", price: 180, description: "Everything in Standard plus appliances and baseboards" },
  { name: "Move In/Out", duration: "5–7 hrs", price: 220, description: "Full property clean, inspection-ready" },
];

export default function ServicesTab() {
  const { data: services = [], isLoading } = useMyServices();
  const create = useCreateMyService();
  const update = useUpdateMyService();
  const remove = useDeleteMyService();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ServiceInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const startAdd = (preset?: ServiceInput) => {
    setForm(preset ?? EMPTY);
    setAdding(true);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (s: { id: string; name: string; description?: string | null; duration?: string | null; price: number }) => {
    setForm({
      name: s.name,
      description: s.description ?? "",
      duration: s.duration ?? "",
      price: s.price,
    });
    setEditingId(s.id);
    setAdding(false);
    setError(null);
  };

  const cancel = () => {
    setAdding(false);
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
  };

  const save = () => {
    if (form.name.trim().length < 2) {
      setError("Give the service a name.");
      return;
    }
    if (!(form.price >= 0)) {
      setError("Enter a valid price.");
      return;
    }
    const dto: ServiceInput = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      duration: form.duration?.trim() || undefined,
      price: Number(form.price),
    };

    if (editingId) {
      update.mutate({ id: editingId, dto }, { onSuccess: cancel });
    } else {
      create.mutate(dto, { onSuccess: cancel });
    }
  };

  const busy = create.isPending || update.isPending;
  const field =
    "w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800";

  const formCard = (
    <Card className="p-5 ring-2 ring-teal-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-900">{editingId ? "Edit service" : "New service"}</h4>
        <button onClick={cancel} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block">Service name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Deep Clean" className={field} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Price ($)</label>
            <input type="number" min={0} step="1" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={field} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Typical duration</label>
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2–3 hrs" className={field} />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block">What&apos;s included <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Kitchen, bathrooms, bedrooms and living areas" className={field} />
        </div>
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        {(create.isError || update.isError) && (
          <p className="text-xs text-red-600 font-semibold">
            {((create.error ?? update.error) as Error).message}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={save} disabled={busy} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            {busy ? "Saving…" : editingId ? "Save changes" : "Add service"}
          </button>
          <button onClick={cancel} className="px-4 py-2.5 rounded-xl ring-1 ring-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
        </div>
      </div>
    </Card>
  );

  if (isLoading) return <div className="h-56 rounded-2xl bg-slate-100 animate-pulse" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900">Your services</h3>
          <p className="text-xs text-slate-500 mt-0.5">These are what clients pick from when booking you.</p>
        </div>
        {!adding && !editingId && (
          <button onClick={() => startAdd()} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Add service
          </button>
        )}
      </div>

      {(adding || editingId) && formCard}

      {services.length === 0 && !adding && (
        <Card className="p-6">
          <div className="text-center mb-5">
            <Sparkles className="w-7 h-7 text-teal-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No services yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Clients can&apos;t book you until you list at least one service. Start from a common one:
            </p>
          </div>
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.name}
                onClick={() => startAdd(s)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 hover:ring-teal-300 text-left transition-colors"
              >
                <Plus className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="flex-1 text-sm font-semibold text-slate-800">{s.name}</span>
                <span className="text-xs text-slate-500">{s.duration}</span>
                <span className="text-sm font-extrabold text-slate-900">${s.price}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {services.map((s) => (
        <Card key={s.id} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900">{s.name}</h4>
              {s.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.description}</p>}
              {s.duration && (
                <span className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="font-extrabold text-xl text-slate-900">${s.price}</div>
              <div className="flex gap-1 mt-2 justify-end">
                <button onClick={() => startEdit(s)} aria-label={`Edit ${s.name}`} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove "${s.name}"? Past bookings keep their history.`)) remove.mutate(s.id);
                  }}
                  disabled={remove.isPending}
                  aria-label={`Delete ${s.name}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {remove.isError && (
        <p className="text-xs text-red-600 font-semibold">{(remove.error as Error).message}</p>
      )}
    </div>
  );
}
