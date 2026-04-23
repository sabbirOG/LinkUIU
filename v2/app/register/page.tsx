"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap, Building2, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [userType, setUserType] = useState<"alumni" | "student">("alumni");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dept, setDept] = useState("CSE");
  const [batch, setBatch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.signUp(email, password, fullName, studentId, userType, dept, batch);
      setSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 pt-24 md:pt-32 pb-12">
           <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1)] p-12 text-center space-y-8 border border-slate-50">
              <div className="h-20 w-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto text-green-500 shadow-sm border border-green-100">
                 <CheckCircle2 size={40} />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Account Created!</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                   Your institutional network profile has been configured successfully. You may now sign in and access the dashboard.
                </p>
              </div>
              <button 
                onClick={() => router.push("/login")}
                className="w-full bg-[#0f172a] text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#f97316] transition-all"
              >
                 <ArrowLeft size={18} /> Back to Sign In
              </button>
           </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-12">
        <div className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-slate-100">
          
          {/* Left Sidebar - Dark Branding */}
          <div className="md:w-[35%] bg-[#0f172a] text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}></div>
            
            <div className="relative z-10 space-y-10">
               <div className="flex items-center gap-3">
                  <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-6 brightness-0 invert opacity-60" />
                  <div className="w-px h-4 bg-white/10"></div>
                  <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Institutional</span>
               </div>
               
               <div className="space-y-6">
                  <h1 className="text-2xl font-black leading-tight tracking-tight">
                    Start your <br />
                    Professional <br />
                    <span className="text-[#f97316]">Trajectory.</span>
                  </h1>
                  
                  <div className="space-y-4 pt-4">
                     {[
                       "Verified alumni network",
                       "Exclusive job opportunities",
                       "Direct mentorship access",
                       "Institutional identity"
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3 group/item">
                          <CheckCircle2 size={14} className="text-[#f97316] stroke-[2.5]" />
                          <span className="text-[12px] font-semibold text-slate-400 group-hover/item:text-white transition-colors">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="relative z-10 pt-6 border-t border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    © UIU PROTOCOL 2026
                </p>
            </div>
          </div>

          {/* Right Area - Register Form */}
          <div className="md:w-[65%] p-8 md:p-10 flex flex-col justify-center">
             <div className="max-w-sm mx-auto w-full space-y-6">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
                   <p className="text-slate-500 text-xs font-medium tracking-wide">Configure your institutional node</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {/* User Type Switcher */}
                <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                    <button 
                      onClick={() => setUserType("alumni")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        userType === "alumni" ? "bg-white shadow-sm text-[#f97316]" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Alumni
                    </button>
                    <button 
                      onClick={() => setUserType("student")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        userType === "student" ? "bg-white shadow-sm text-[#f97316]" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Student
                    </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</label>
                         <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alice Ahmed" className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-xs" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Student ID</label>
                         <input required type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="011 211 000" className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-xs" />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Department</label>
                         <select 
                           required 
                           value={dept} 
                           onChange={(e) => setDept(e.target.value)} 
                           className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-bold text-slate-900 text-[10px] appearance-none cursor-pointer"
                         >
                            <option value="CSE">Computer Science</option>
                            <option value="EEE">Electrical Engineering</option>
                            <option value="BBA">Business Admin</option>
                            <option value="Civil">Civil Engineering</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Economics">Economics</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Batch</label>
                         <input 
                           required 
                           type="text" 
                           value={batch} 
                           onChange={(e) => setBatch(e.target.value)} 
                           placeholder="Ex: 221" 
                           className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-xs" 
                         />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Email</label>
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@alumni.uiu.ac.bd" className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-xs" />
                   </div>
                   
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Password</label>
                      <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-xs" />
                   </div>

                   <button 
                     disabled={isLoading} 
                     className="w-full bg-[#f97316] text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:bg-slate-900 transition-all mt-4 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed text-[11px]"
                   >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "INITIALIZE IDENTITY"
                      )}
                   </button>
                </form>

                <div className="text-center">
                   <p className="text-sm font-medium text-slate-500">
                      Already an alumnus? <Link href="/login" className="text-[#f97316] font-bold hover:underline">Sign In</Link>
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
