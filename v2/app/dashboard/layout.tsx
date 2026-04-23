"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useGlobalStore } from "@/lib/store";
import { ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, currentUser, isCloudMode } = useGlobalStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#f97316] mb-4" size={32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing Network...</p>
      </div>
    );
  }

  // Strict Authentication Boundary Enforced
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
           <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={28} />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
           <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
             You are accessing a secured institutional route. All mock and placeholder data has been purged. You must connect your Supabase database and create an account to proceed.
           </p>
           <Link href="/login" className="inline-flex h-12 px-8 bg-slate-900 hover:bg-[#f97316] text-white rounded-xl items-center justify-center font-bold text-sm transition-all shadow-sm">
              Proceed to Sign In
           </Link>
           {!isCloudMode && (
             <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-6 pt-6 border-t border-slate-100">
               Missing SUPABASE_URL in .env
             </p>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Restored Original Top Header Navigation */}
      <Navbar />

      <main className="w-full pt-[64px]">
        {children}
      </main>
    </div>
  );
}
