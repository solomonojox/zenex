import type { LucideIcon } from "lucide-react";

export interface Service {
  name: string;
  duration: string;
  price: number;
  desc: string;
}

export interface Provider {
  id: number;
  name: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  verified: boolean;
  elite: boolean;
  instant: boolean;
  tags: string[];
  image: string;
  completions: number;
  responseTime: string;
  languages: string[];
  bio: string;
  services: Service[];
  ai_match: number;
}

export interface ServiceCategory {
  Icon: LucideIcon;
  label: string;
  sub: string;
  c: string;
}

export interface Testimonial {
  name: string;
  loc: string;
  ini: string;
  rating: number;
  svc: string;
  text: string;
}

export interface Booking {
  id: string;
  provider: string;
  service: string;
  date: string;
  time: string;
  status: string;
  price: number;
  img: string;
}

export interface MessageThreadItem {
  from: "user" | "them";
  text: string;
  time: string;
}

export interface MessageThread {
  id: number;
  name: string;
  preview: string;
  time: string;
  unread: number;
  img: string;
  thread: MessageThreadItem[];
}

export interface EarningsPoint {
  w: string;
  earn: number;
  jobs: number;
}

export interface Transaction {
  id: string;
  desc: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
  status: string;
}

export interface Payout {
  date: string;
  amount: number;
  jobs: number;
  ref: string;
  status: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "client" | "provider";
  status: string;
  joined: string;
  bookings: number;
}

export interface VerificationRequest {
  name: string;
  city: string;
  submitted: string;
  docs: string[];
}

export interface PieDatum {
  name: string;
  value: number;
  color: string;
}

export interface UpcomingJob {
  client: string;
  addr: string;
  svc: string;
  date: string;
  time: string;
  hrs: number;
  pay: number;
  av: string;
}

export interface SubscriptionPlan {
  name: string;
  freq: string;
  price: number;
  saves: number;
  features: string[];
  popular?: boolean;
}

export interface Dispute {
  id: string;
  client: string;
  provider: string;
  issue: string;
  date: string;
  priority: "high" | "medium" | "low";
}
