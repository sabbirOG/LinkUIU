"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";

// Metadata is handled by a parent layout or a special component in 'use client' files, 
// but since this is a Next.js 14 App Router, I should ideally have a separate metadata file 
// or move the Client logic to a subcomponent. 
// However, I will add a simple title tag directly in the return for now.

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await authService.signInWithOAuth(provider);
    } catch (err: any) {
      setError(`OAuth failed: ${err.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-12">
        <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-slate-100">
          
          {/* Left Sidebar - Dark Branding */}
          <div className="md:w-[38%] bg-[#0f172a] text-white p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}></div>
            
            <div className="relative z-10 space-y-10">
               <div className="flex items-center gap-3">
                  <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-8 brightness-0 invert opacity-60" />
                  <div className="w-px h-5 bg-white/10"></div>
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Institutional</span>
               </div>
               
               <div className="space-y-4">
                  <h1 className="text-3xl font-black leading-tight tracking-tight">
                    Continue your <br />
                    <span className="text-[#f97316]">Professional</span> <br />
                    Growth.
                  </h1>
                  
                  <div className="space-y-4 pt-4">
                     {[
                       "Premium Job Hub",
                       "Global Connection",
                       "Alumni Messaging",
                       "Career Insights"
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3 group/item">
                          <CheckCircle2 size={16} className="text-[#f97316] stroke-[2.5]" />
                          <span className="text-[13px] font-semibold text-slate-400 group-hover/item:text-white transition-colors">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="relative z-10 pt-8 border-t border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    © UIU PROTOCOL 2026
                </p>
            </div>
          </div>

          {/* Right Area - Login Form */}
          <div className="md:w-[62%] p-8 md:p-12 flex flex-col justify-center bg-white">
             <div className="max-w-md mx-auto w-full space-y-8">
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login to Account</h2>
                   <p className="text-slate-500 font-medium tracking-wide">Enter your credentials to continue</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleLogin}>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. sabbir@uiu.ac.bd" 
                        className="w-full px-6 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 focus:border-[#f97316]/20 transition-all font-medium text-slate-900" 
                      />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                         <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-[#f97316] hover:underline">Forgot?</Link>
                      </div>
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full px-6 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 focus:border-[#f97316]/20 transition-all font-medium text-slate-900" 
                      />
                   </div>

                   <button 
                     disabled={loading}
                     className="w-full bg-[#f97316] text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl shadow-[0_10px_30px_-10px_rgba(249,115,22,0.4)] hover:bg-orange-600 hover:shadow-orange-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>Sign In <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
                      )}
                   </button>
                </form>

                {/* OAuth / Social Login */}
                <div className="space-y-6">
                   <div className="relative flex items-center gap-4">
                      <div className="flex-1 h-px bg-slate-100"></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">OR CONTINUE WITH</span>
                      <div className="flex-1 h-px bg-slate-100"></div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleOAuth('google')}
                        className="h-14 border border-slate-100 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all group"
                      >
                         <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4 grayscale group-hover:grayscale-0 transition-all" />
                         <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Google</span>
                      </button>
                      <button 
                        onClick={() => handleOAuth('github')}
                        className="h-14 border border-slate-100 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all group"
                      >
                         <svg className="h-5 w-5 text-slate-400 group-hover:text-black transition-all fill-current" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.15 2.898-.15 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                         </svg>
                         <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">GitHub</span>
                      </button>
                   </div>
                </div>

                <div className="text-center pt-6">
                   <p className="text-sm font-medium text-slate-500">
                      Don&apos;t have an account? <Link href="/register" className="text-[#f97316] font-bold hover:underline">Register Now</Link>
                   </p>
                </div>
             </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
