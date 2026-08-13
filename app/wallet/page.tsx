"use client";

import { useEffect, useState } from "react";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/auth/useAuth";
import ClientWallet from "@/components/wallet/ClientWallet";
import ProviderWallet from "@/components/wallet/ProviderWallet";

type WalletTab = "client" | "provider";

export default function WalletPage() {
  return (
    <RouteGuard>
      <Wallet />
    </RouteGuard>
  );
}

function Wallet() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [walletTab, setWalletTab] = useState<WalletTab>("client");

  // Show the wallet matching the user's role.
  useEffect(() => {
    if (user?.role === "PROVIDER") setWalletTab("provider");
    else if (user?.role === "CLIENT") setWalletTab("client");
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Wallet & Payments</h1>
          {/* Only admins can inspect both wallet types; others see their own. */}
          {isAdmin && (
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setWalletTab("client")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${walletTab === "client" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>Client</button>
              <button onClick={() => setWalletTab("provider")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${walletTab === "provider" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>Provider</button>
            </div>
          )}
        </div>
        {walletTab === "provider" ? <ProviderWallet /> : <ClientWallet />}
      </div>
      <div className="h-24" />
    </div>
  );
}
