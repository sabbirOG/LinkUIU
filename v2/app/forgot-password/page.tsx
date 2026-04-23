"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20 px-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
             <div className="h-20 w-20 bg-orange-50 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm">
                <KeyRound size={40} />
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight">Recover Password</h1>
             <p className="text-slate-500 font-medium">No worries, we&apos;ll send you instructions.</p>
          </div>

          {!submitted ? (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="name@alumni.uiu.ac.bd"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-100 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Send Recovery Link
              </button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-primary transition-colors pt-4">
                 <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] text-center space-y-6 animate-in fade-in zoom-in duration-500">
               <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck size={28} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-bold">Check your email</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">We have sent password recovery instructions to your registered email address.</p>
               </div>
               <button 
                 onClick={() => setSubmitted(false)}
                 className="w-full py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 hover:bg-slate-50 transition-all"
               >
                 Resend Email
               </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
