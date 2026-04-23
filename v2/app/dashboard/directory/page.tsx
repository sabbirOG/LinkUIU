"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Filter, 
  UserPlus,
  ShieldCheck,
  Check,
  RotateCcw,
  SlidersHorizontal,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";

export default function DirectoryPage() {
  const { alumni: storeAlumni, toggleConnection, isLoaded } = useGlobalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredAlumni = useMemo(() => {
    return storeAlumni.filter(person => {
      if (person.isSelf) return false;
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            person.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            person.job?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDepts.length === 0 || (person.dept && selectedDepts.includes(person.dept));
      const matchesBatch = selectedBatches.length === 0 || (person.batch && selectedBatches.includes(person.batch));
      
      return matchesSearch && matchesDept && matchesBatch;
    });
  }, [searchQuery, selectedDepts, selectedBatches, storeAlumni]);

  const batches = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"];

  const toggleBatch = (batch: string) => {
    setSelectedBatches(prev => prev.includes(batch) ? prev.filter(b => b !== batch) : [...prev, batch]);
  };

  const categories = [
    { title: "School of Business & Economics", depts: ["BBA", "BBA in AIS", "BS in Economics"] },
    { title: "School of Science & Engineering", depts: ["CE", "CSE", "BSDS", "EEE"] },
    { title: "School of Humanities & Social Sciences", depts: ["BSSEDS", "MSJ", "BA in English"] },
    { title: "Life Sciences", depts: ["B. Pharm.", "BSBGE"] }
  ];

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev => {
      if (prev.includes(dept)) return prev.filter(d => d !== dept);
      const next = [...prev, dept];
      return next.length > 3 ? next.slice(1) : next;
    });
  };

  if (!isLoaded) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-1 w-full bg-slate-100 overflow-hidden rounded-full mb-4 max-w-[200px]">
        <div className="h-full bg-[#f97316] animate-progress-ind"></div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning Network</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      
      {/* PROFESSIONAL HEADER FRAME */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[#f97316] font-black text-[9px] uppercase tracking-widest">
                <ShieldCheck size={12} strokeWidth={3} /> Verified Identity Portal
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                  Alumni <span className="text-slate-300 font-normal">Network</span>
                </h1>
                <p className="text-[15px] font-medium text-slate-500 leading-relaxed max-w-xl">
                  Connect with the global UIU institutional network. Discover talent, mentor peers, and build professional bridges.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-96">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f97316] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name, company, or role..." 
                    className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#f97316]/20 focus:ring-4 focus:ring-[#f97316]/5 rounded-2xl pl-12 pr-4 py-4 text-[14px] font-medium transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
           
           {/* Filters Sidebar (Desktop) */}
           <aside className="lg:w-72 space-y-8 flex-shrink-0 hidden lg:block">
              <div className="sticky top-44 space-y-6">
                 <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                          <Filter size={12} className="text-[#f97316]" /> Filter Results
                       </h3>
                       <button onClick={() => { setSelectedDepts([]); setSelectedBatches([]); }} className="text-[10px] font-bold text-[#f97316] hover:underline">Reset</button>
                    </div>

                    <div className="p-6 space-y-8">
                       {categories.map((cat) => (
                         <div key={cat.title} className="space-y-4">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">{cat.title}</h4>
                            <div className="flex flex-col gap-1">
                               {cat.depts.map((dept) => (
                                 <button 
                                   key={dept} 
                                   onClick={() => toggleDept(dept)}
                                   className={cn(
                                     "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group text-left",
                                     selectedDepts.includes(dept) ? "text-[#f97316]" : "text-slate-500 hover:bg-slate-50"
                                   )}
                                 >
                                    <div className={cn("h-4 w-4 rounded border flex items-center justify-center transition-all", selectedDepts.includes(dept) ? "border-[#f97316] bg-[#f97316]" : "border-slate-300 bg-white")}>
                                       {selectedDepts.includes(dept) && <Check size={10} strokeWidth={4} className="text-white" />}
                                    </div>
                                    {dept}
                                 </button>
                               ))}
                            </div>
                         </div>
                       ))}
                       
                       <div className="space-y-4">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Graduation Wave</h4>
                          <div className="flex flex-wrap gap-2">
                             {batches.map((batch) => (
                               <button 
                                 key={batch} 
                                 onClick={() => toggleBatch(batch)}
                                 className={cn(
                                   "h-8 px-3 rounded-lg text-[10px] font-bold transition-all border",
                                   selectedBatches.includes(batch) ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                                 )}
                               >
                                  {batch}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </aside>

           {/* Mobile Filter Drawer */}
           {isMobileFilterOpen && (
             <div className="fixed inset-0 z-[200] lg:hidden">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Filter Results</h3>
                      <button onClick={() => setIsMobileFilterOpen(false)} className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center"><X size={20} /></button>
                   </div>
                   
                   <div className="space-y-8">
                      {categories.map((cat) => (
                        <div key={cat.title}>
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{cat.title}</h4>
                           <div className="grid grid-cols-2 gap-2">
                              {cat.depts.map((dept) => (
                                <button 
                                  key={dept}
                                  onClick={() => toggleDept(dept)}
                                  className={cn(
                                    "px-4 py-3.5 rounded-xl text-xs font-bold transition-all border",
                                    selectedDepts.includes(dept) ? "bg-[#f97316] border-[#f97316] text-white" : "bg-slate-50 border-slate-100 text-slate-500"
                                  )}
                                >
                                   {dept}
                                </button>
                              ))}
                           </div>
                        </div>
                      ))}
                      
                      <div className="pb-10">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Batch Selection</h4>
                         <div className="grid grid-cols-3 gap-2">
                            {batches.map((batch) => (
                              <button 
                                key={batch}
                                onClick={() => toggleBatch(batch)}
                                className={cn(
                                  "px-3 py-3.5 rounded-xl text-xs font-bold transition-all border",
                                  selectedBatches.includes(batch) ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-100 text-slate-500"
                                )}
                              >
                                 {batch}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => setIsMobileFilterOpen(false)}
                     className="w-full bg-[#f97316] text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-200 sticky bottom-0"
                   >
                      Update Results
                   </button>
                </div>
             </div>
           )}

           {/* Results Grid */}
           <div className="flex-1 space-y-6">
               <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-2">
                  <p>{filteredAlumni.length} professionals found</p>
                  <div className="flex items-center gap-2">
                     <span className="hidden sm:inline">Sort by:</span>
                     <select className="bg-transparent border-none text-slate-900 font-black focus:ring-0 cursor-pointer outline-none">
                        <option>Recent Activity</option>
                        <option>Batch</option>
                        <option>Name A-Z</option>
                     </select>
                  </div>
               </div>

              {filteredAlumni.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                   {filteredAlumni.map((person) => (
                      <div key={person.id} className="group relative bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#f97316]/30 transition-all duration-500 flex flex-col overflow-hidden">
                         <div className="p-6 flex flex-col items-center text-center space-y-4 flex-1">
                            <Link href={`/dashboard/profile/${person.id}`} className="relative h-20 w-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-2xl font-black text-slate-300 group-hover:text-white group-hover:bg-[#f97316] transition-all duration-500 overflow-hidden shadow-inner border border-slate-100">
                               {person.name.charAt(0)}
                               <div className="absolute inset-0 bg-transparent transition-all"></div>
                            </Link>

                            <div className="space-y-1 w-full">
                               <Link href={`/dashboard/profile/${person.id}`} className="text-lg font-black text-slate-900 hover:text-[#f97316] transition-colors line-clamp-1 tracking-tight">{person.name}</Link>
                               <p className="text-[11px] font-black text-[#f97316] px-2 line-clamp-1 uppercase tracking-widest">{person.job}</p>
                               <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{person.company}</p>
                            </div>

                            <div className="w-full pt-4 border-t border-slate-50">
                               <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#f97316]" /> {person.location}</span>
                                  <span className="bg-slate-50 px-2 py-1 border border-slate-100 rounded-lg text-slate-600">{person.dept} '{person.batch?.slice(-2) || "XX"}</span>
                                </div>
                            </div>
                         </div>

                         <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex gap-2">
                            <Link 
                               href={`/dashboard/messages?user=${person.id}`}
                               className="flex-1 h-11 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl border border-slate-200 hover:border-[#f97316]/20 hover:text-[#f97316] transition-all flex items-center justify-center active:scale-95 shadow-sm"
                            >
                               Message
                            </Link>
                            {person.isConnected ? (
                              <div className="flex-1 h-11 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center">
                                 <Check size={14} className="mr-1.5" /> Linked
                              </div>
                            ) : (
                              <button 
                                 onClick={() => toggleConnection(person.id)}
                                 className="flex-1 h-11 bg-[#f97316] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-orange-100"
                              >
                                 <UserPlus size={14} /> Connect
                              </button>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-[40px] py-32 text-center shadow-sm">
                   <div className="h-24 w-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-100 mb-8">
                     <Search size={40} className="text-slate-200" />
                   </div>
                   <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Identity Mismatch</h3>
                   <p className="text-slate-400 text-sm mt-2 font-medium">No members found matching your institutional filters.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress-ind {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-ind {
          width: 50%;
          animation: progress-ind 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
