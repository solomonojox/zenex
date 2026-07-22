"use client";

import { useState } from "react";
import type { Provider } from "@/lib/types";
import AboutTab from "./AboutTab";
import ServicesTab from "./ServicesTab";
import ReviewsTab from "./ReviewsTab";
import BookingWidget from "./BookingWidget";

type TabKey = "about" | "services" | "reviews";

export default function ProfileTabs({ p }: { p: Provider }) {
  const [tab, setTab] = useState<TabKey>("services");
  const [selSvc, setSelSvc] = useState(p.services.length > 1 ? 1 : 0);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 pb-24">
      <div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          {(["about", "services", "reviews"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${tab === t ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "about" && <AboutTab p={p} />}
        {tab === "services" && <ServicesTab services={p.services} selected={selSvc} onSelect={setSelSvc} />}
        {tab === "reviews" && <ReviewsTab p={p} />}
      </div>

      <BookingWidget p={p} selected={selSvc} />
    </div>
  );
}
