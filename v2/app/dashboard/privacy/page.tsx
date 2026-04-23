"use client";

import React from "react";
import { Lock, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-xs font-bold uppercase tracking-widest"
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-10 lg:p-16 shadow-sm space-y-12">
        <div className="flex items-center gap-4 text-[#f97316]">
          <Lock size={32} strokeWidth={3} />
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Protocol</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Data Protection</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">1. Data Sovereignty</h2>
            <p>Your institutional data remains encrypted and is only used to power the LinkedUIU networking engine. We do not share data with external third-party advertisers.</p>
          </section>

          <section className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">2. Visibility Controls</h2>
            <p>You have full control over your secondary contact data. Institutional identifiers (Name, Batch, Dept) are public within the verified network to ensure transparency.</p>
          </section>

          <section className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">3. Secure Communications</h2>
            <p>Direct messages and collaboration requests are transmitted over secure, encrypted channels exclusive to the UIU Alumni Protocol.</p>
          </section>
        </div>

        <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Updated March 2026</p>
          <div className="px-4 py-2 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">Privacy Framework 1.2</div>
        </div>
      </div>
    </div>
  );
}
