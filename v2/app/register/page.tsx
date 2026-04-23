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
      
      <div className="flex-1 flex items-center justify-center p-6 pt-24 md:pt-32 pb-12">
        <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[700px]">
          
          {/* Left Sidebar - Dark Branding */}
          <div className="md:w-5/12 bg-[#0f172a] text-white p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 space-y-12">
               <div className="flex items-center gap-4">
                  <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-10 brightness-0 invert" />
                  <div className="w-px h-6 bg-white/20"></div>
                  <span className="text-sm font-bold tracking-tight text-slate-100 italic">Join LinkUIU</span>
               </div>
               
               <div className="space-y-6">
                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Start your <br />
                    professional <br />
                    <span className="text-[#f97316]">Alumni Journey.</span>
                  </h1>
                  
                  <div className="space-y-5 pt-4">
                     {[
                       "Verified alumni network",
                       "Exclusive job opportunities",
                       "Direct mentorship access",
                       "Professional resume builder"
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-4 group/item">
                         <div className="h-6 w-6 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-lg shadow-orange-900/20 group-hover/item:scale-110 transition-transform">
                            <CheckCircle2 size={14} className="stroke-[3]" />
                         </div>
                         <span className="text-sm font-medium text-slate-300 group-hover/item:text-white transition-colors">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="relative z-10">
               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  © UIU Alumni Association {new Date().getFullYear()}
               </p>
            </div>
          </div>

          {/* Right Area - Register Form */}
          <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center">
             <div className="max-w-md mx-auto w-full space-y-8">
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                   <p className="text-slate-500 font-medium tracking-wide">Select your role to get started</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {/* User Type Switcher */}
                <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <button 
                      onClick={() => setUserType("alumni")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        userType === "alumni" ? "bg-white shadow-lg text-[#f97316]" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Building2 size={16} /> Alumni
                    </button>
                    <button 
                      onClick={() => setUserType("student")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        userType === "student" ? "bg-white shadow-lg text-[#f97316]" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <GraduationCap size={16} /> Student
                    </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</label>
                         <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alice Ahmed" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Student ID</label>
                         <input required type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="011 211 000" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-sm" />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Department</label>
                         <select 
                           required 
                           value={dept} 
                           onChange={(e) => setDept(e.target.value)} 
                           className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-bold text-slate-900 text-[11px] appearance-none cursor-pointer"
                         >
                            <option value="CSE">Computer Science</option>
                            <option value="EEE">Electrical Engineering</option>
                            <option value="BBA">Business Admin</option>
                            <option value="Civil">Civil Engineering</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Economics">Economics</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Graduation Batch</label>
                         <input 
                           required 
                           type="text" 
                           value={batch} 
                           onChange={(e) => setBatch(e.target.value)} 
                           placeholder="Ex: 221" 
                           className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-sm" 
                         />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email</label>
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@alumni.uiu.ac.bd" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-sm" />
                   </div>
                   
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Password</label>
                      <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all font-medium text-slate-900 text-sm" />
                   </div>

                   <button 
                     disabled={isLoading} 
                     className="w-full bg-[#f97316] text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl shadow-[0_10px_30px_-10px_rgba(249,115,22,0.4)] hover:bg-orange-600 transition-all mt-4 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "JOIN THE COMMUNITY"
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
