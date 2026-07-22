import {
  Home, Briefcase, Zap, Sparkles, Repeat, Package,
} from "lucide-react";
import type {
  Provider, ServiceCategory, Testimonial, Booking, MessageThread,
  EarningsPoint, Transaction, Payout, AdminUser, VerificationRequest,
  PieDatum, UpcomingJob, SubscriptionPlan, Dispute,
} from "./types";

export const PROVIDERS: Provider[] = [
  {
    id: 1, name: "Maria Santos", title: "Home Cleaning Specialist",
    location: "Toronto, ON", rating: 4.97, reviews: 312, price: 45,
    verified: true, elite: true, instant: true,
    tags: ["Deep Clean", "Move-in/out", "Recurring"],
    image: "https://images.unsplash.com/photo-1647381518264-97ff1835026f?w=400&h=500&fit=crop&auto=format",
    completions: 847, responseTime: "< 1 hr", languages: ["English", "Portuguese"],
    bio: "Professional cleaner with 8+ years of experience. Specializing in deep cleaning, move-in/out, and recurring home maintenance. Fully insured and background-checked.",
    services: [
      { name: "Standard Clean", duration: "2–3 hrs", price: 90, desc: "Kitchen, bathrooms, bedrooms, living areas" },
      { name: "Deep Clean", duration: "4–6 hrs", price: 180, desc: "Everything in Standard + appliances, baseboards, window sills" },
      { name: "Move In/Out", duration: "5–7 hrs", price: 220, desc: "Full property clean for moving transitions, inspection-ready" },
    ],
    ai_match: 98,
  },
  {
    id: 2, name: "James Kowalski", title: "Commercial & Residential Pro",
    location: "Vancouver, BC", rating: 4.94, reviews: 218, price: 52,
    verified: true, elite: false, instant: true,
    tags: ["Office", "Commercial", "Home"],
    image: "https://images.unsplash.com/photo-1720772569819-b18d48a77ca9?w=400&h=500&fit=crop&auto=format",
    completions: 503, responseTime: "< 2 hr", languages: ["English", "Polish"],
    bio: "Owner of Sparkling Clean Co. serving Vancouver and surroundings since 2015. Fully bonded and insured.",
    services: [
      { name: "Standard Clean", duration: "2–3 hrs", price: 95, desc: "Kitchen, bathrooms, bedrooms, living areas" },
      { name: "Commercial Clean", duration: "3–5 hrs", price: 210, desc: "Office and commercial space cleaning" },
    ],
    ai_match: 91,
  },
  {
    id: 3, name: "David Chen", title: "Eco-Friendly Cleaning Expert",
    location: "Calgary, AB", rating: 4.92, reviews: 174, price: 48,
    verified: true, elite: true, instant: false,
    tags: ["Eco", "Pet-friendly", "Deep Clean"],
    image: "https://images.unsplash.com/photo-1668434484067-7f42d511812f?w=400&h=500&fit=crop&auto=format",
    completions: 421, responseTime: "< 30 min", languages: ["English", "Mandarin"],
    bio: "All products are non-toxic, eco-certified, and safe for children and pets.",
    services: [
      { name: "Eco Standard Clean", duration: "2–3 hrs", price: 96, desc: "Non-toxic products, kitchen, bathrooms, living areas" },
      { name: "Eco Deep Clean", duration: "4–6 hrs", price: 190, desc: "Full eco-certified deep clean" },
    ],
    ai_match: 87,
  },
  {
    id: 4, name: "Équipe Nettoyage Pro", title: "Agency · 12-person team",
    location: "Montréal, QC", rating: 4.89, reviews: 96, price: 38,
    verified: true, elite: false, instant: false,
    tags: ["Bilingual", "Office", "Floors"],
    image: "https://images.unsplash.com/photo-1736289162890-78f1ff4f8bd3?w=400&h=500&fit=crop&auto=format",
    completions: 1203, responseTime: "< 3 hr", languages: ["English", "French"],
    bio: "Certifié par l'ISSA. Serving Montréal clients in English and French since 2017.",
    services: [
      { name: "Standard Clean", duration: "2–3 hrs", price: 80, desc: "Kitchen, bathrooms, bedrooms, living areas" },
      { name: "Office Clean", duration: "2–4 hrs", price: 150, desc: "Bilingual office cleaning team" },
    ],
    ai_match: 82,
  },
];

export const SERVICE_CATS: ServiceCategory[] = [
  { Icon: Home, label: "Home Clean", sub: "2,400+ pros", c: "teal" },
  { Icon: Briefcase, label: "Office", sub: "890+ pros", c: "blue" },
  { Icon: Zap, label: "Deep Clean", sub: "1,100+ pros", c: "emerald" },
  { Icon: Sparkles, label: "Move In/Out", sub: "670+ pros", c: "violet" },
  { Icon: Repeat, label: "Recurring", sub: "1,800+ pros", c: "orange" },
  { Icon: Package, label: "Post-Reno", sub: "340+ pros", c: "rose" },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: "Sarah Mitchell", loc: "Toronto, ON", ini: "SM", rating: 5, svc: "Recurring Home Clean",
    text: "Zenex has been a lifesaver. Maria cleans every two weeks and the quality is always exceptional. Worth every penny." },
  { name: "Luc Bélanger", loc: "Montréal, QC", ini: "LB", rating: 5, svc: "Office Cleaning",
    text: "Excellent service, résultat impeccable. Robert speaks perfect French and English — my office has never looked better." },
  { name: "Priya Sharma", loc: "Vancouver, BC", ini: "PS", rating: 5, svc: "Move-Out Cleaning",
    text: "As a property manager I use Zenex for all turnovers. The vetting process gives me confidence and booking is incredibly smooth." },
];

export const BOOKINGS: Booking[] = [
  { id: "BK-2841", provider: "Maria Santos", service: "Deep Home Clean", date: "Fri, Jul 4", time: "9:00 AM – 1:00 PM", status: "confirmed", price: 217, img: "https://images.unsplash.com/photo-1647381518264-97ff1835026f?w=80&h=80&fit=crop&auto=format" },
  { id: "BK-2756", provider: "James Kowalski", service: "Office Clean (Weekly)", date: "Mon, Jun 30", time: "7:00 – 10:00 AM", status: "completed", price: 156, img: "https://images.unsplash.com/photo-1720772569819-b18d48a77ca9?w=80&h=80&fit=crop&auto=format" },
  { id: "BK-2701", provider: "David Chen", service: "Eco Standard Clean", date: "Mon, Jun 23", time: "10:00 AM – 12:00 PM", status: "completed", price: 96, img: "https://images.unsplash.com/photo-1668434484067-7f42d511812f?w=80&h=80&fit=crop&auto=format" },
];

// Message thread ids correspond to PROVIDERS ids (1 = Maria, 2 = James, 3 = David)
export const MESSAGES: MessageThread[] = [
  { id: 1, name: "Maria Santos", preview: "Perfect! I'll bring all eco supplies for the deep clean.", time: "2m", unread: 2,
    img: "https://images.unsplash.com/photo-1647381518264-97ff1835026f?w=80&h=80&fit=crop&auto=format",
    thread: [
      { from: "user", text: "Hi Maria! Booking confirmed for July 4th — 9am still good?", time: "10:14 AM" },
      { from: "them", text: "Yes absolutely! I'll be there at 9am sharp. Should I bring supplies?", time: "10:22 AM" },
      { from: "user", text: "Yes please, we prefer eco-friendly products if possible.", time: "10:35 AM" },
      { from: "them", text: "Perfect! I'll bring all eco supplies for the deep clean.", time: "10:37 AM" },
    ] },
  { id: 2, name: "James Kowalski", preview: "Thank you for the great review! See you next week.", time: "1h", unread: 0,
    img: "https://images.unsplash.com/photo-1720772569819-b18d48a77ca9?w=80&h=80&fit=crop&auto=format", thread: [] },
  { id: 3, name: "David Chen", preview: "Can you confirm the address for Thursday?", time: "Yest.", unread: 1,
    img: "https://images.unsplash.com/photo-1668434484067-7f42d511812f?w=80&h=80&fit=crop&auto=format", thread: [] },
];

export const EARNINGS_DATA: EarningsPoint[] = [
  { w: "Jun 2", earn: 840, jobs: 6 }, { w: "Jun 9", earn: 1120, jobs: 8 },
  { w: "Jun 16", earn: 960, jobs: 7 }, { w: "Jun 23", earn: 1380, jobs: 10 },
  { w: "Jun 30", earn: 1200, jobs: 9 }, { w: "Jul 7", earn: 1560, jobs: 12 },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "TXN-8821", desc: "Deep Clean — Maria Santos", date: "Jul 4, 2025", amount: -217, type: "debit", status: "completed" },
  { id: "TXN-8756", desc: "Office Clean — James Kowalski", date: "Jun 30, 2025", amount: -156, type: "debit", status: "completed" },
  { id: "TXN-8701", desc: "Refund — BK-2650 (cancelled)", date: "Jun 25, 2025", amount: 96, type: "credit", status: "refunded" },
  { id: "TXN-8612", desc: "Eco Standard Clean — David Chen", date: "Jun 23, 2025", amount: -96, type: "debit", status: "completed" },
  { id: "TXN-8580", desc: "Move-Out Clean — Maria Santos", date: "Jun 10, 2025", amount: -259, type: "debit", status: "completed" },
];

export const PROV_PAYOUTS: Payout[] = [
  { date: "Jul 8, 2025", amount: 1404, jobs: 12, ref: "PAY-441", status: "pending" },
  { date: "Jun 30, 2025", amount: 1140, jobs: 9, ref: "PAY-412", status: "paid" },
  { date: "Jun 23, 2025", amount: 918, jobs: 7, ref: "PAY-388", status: "paid" },
];

export const ADMIN_USERS: AdminUser[] = [
  { id: "U-1041", name: "Alexandra Park", email: "alex.park@email.com", role: "client", status: "active", joined: "Mar 12, 2025", bookings: 23 },
  { id: "U-1039", name: "Maria Santos", email: "maria.santos@email.com", role: "provider", status: "active", joined: "Feb 8, 2025", bookings: 847 },
  { id: "U-1035", name: "James Kowalski", email: "james.k@zenex.ca", role: "provider", status: "active", joined: "Jan 22, 2025", bookings: 503 },
  { id: "U-1028", name: "Luc Bélanger", email: "luc.b@email.com", role: "client", status: "suspended", joined: "Dec 14, 2024", bookings: 4 },
];

export const VERIFICATION_QUEUE: VerificationRequest[] = [
  { name: "Sophie Tremblay", city: "Ottawa, ON", submitted: "2h ago", docs: ["ID", "Insurance", "Background check"] },
  { name: "Raj Patel", city: "Brampton, ON", submitted: "5h ago", docs: ["ID", "Insurance"] },
  { name: "Clean Team Co.", city: "Calgary, AB", submitted: "1d ago", docs: ["ID", "Insurance", "Business Reg.", "Background check"] },
];

export const PIE_DATA: PieDatum[] = [
  { name: "Home Clean", value: 42, color: "#0D9488" },
  { name: "Deep Clean", value: 28, color: "#10B981" },
  { name: "Office", value: 18, color: "#3B82F6" },
  { name: "Other", value: 12, color: "#94A3B8" },
];

export const UPCOMING_JOBS: UpcomingJob[] = [
  { client: "Alexandra Park", addr: "42 Elm St, Toronto", svc: "Deep Clean", date: "Jul 4", time: "9:00 AM", hrs: 4, pay: 180, av: "AP" },
  { client: "Michael Chen", addr: "815 King St W, Toronto", svc: "Standard Clean", date: "Jul 5", time: "2:00 PM", hrs: 2, pay: 90, av: "MC" },
  { client: "Jennifer Wu", addr: "200 Front St, Toronto", svc: "Move-Out Clean", date: "Jul 8", time: "10:00 AM", hrs: 6, pay: 270, av: "JW" },
];

export const CITIES: string[] = ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Quebec City"];

export const SUBSCRIPTIONS: SubscriptionPlan[] = [
  { name: "Starter", freq: "Monthly", price: 129, saves: 15, features: ["1 standard clean/month", "Priority booking", "10% extras discount"] },
  { name: "Regular", freq: "Bi-weekly", price: 219, saves: 20, features: ["2 standard cleans/month", "Priority booking", "15% extras discount", "Dedicated cleaner"], popular: true },
  { name: "Premium", freq: "Weekly", price: 379, saves: 25, features: ["4 standard cleans/month", "Priority booking", "20% extras discount", "Dedicated cleaner", "Same-day guarantee"] },
];

export const DISPUTES: Dispute[] = [
  { id: "DSP-082", client: "Priya Sharma", provider: "James Kowalski", issue: "Service not completed as described", date: "Jun 28", priority: "high" },
  { id: "DSP-079", client: "Marcus Lee", provider: "David Chen", issue: "Cleaner arrived 2 hours late", date: "Jun 25", priority: "medium" },
  { id: "DSP-077", client: "Emma Wilson", provider: "Sophie Tremblay", issue: "Billing discrepancy — overcharged", date: "Jun 22", priority: "low" },
];

export const EXTRAS_LIST: { name: string; price: number; Icon: ServiceCategory["Icon"] }[] = [
  { name: "Inside Fridge", price: 25, Icon: Package },
  { name: "Inside Oven", price: 30, Icon: Zap },
  { name: "Laundry (1 load)", price: 20, Icon: Repeat },
  { name: "Interior Windows", price: 35, Icon: Sparkles },
];

export function getProviderById(id: number): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getMessageThreadByProviderId(id: number): MessageThread | undefined {
  return MESSAGES.find((m) => m.id === id);
}
