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
  SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";

export default function DirectoryPage() {
  const { alumni: storeAlumni, toggleConnection, isLoaded } = useGlobalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredAlumni = useMemo(() => {
    return storeAlumni.filter(person => {
      if (person.isSelf) return false;
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) || person.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(person.dept);
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, selectedDepts, storeAlumni]);

  const categories = [
    { title: "School of Business & Economics", depts: ["BBA", "BBA in AIS", "BS in Economics"] },
    { title: "School of Science & Engineering", depts: ["CE", "CSE", "BSDS", "EEE"] },
    { title: "School of Humanities & Social Sciences", depts: ["BSSEDS", "MSJ", "BA in English"] },
    { title: "School of Life Sciences", depts: ["B. Pharm.", "BSBGE"] }
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
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Synchronizing Network</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      
      {/* PROFESSIONAL HEADER FRAME */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 pb-8 md:pt-8 md:pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100/50 text-[#f97316] font-bold text-[10px] uppercase tracking-wider">
                <ShieldCheck size={12} strokeWidth={3} />
                Verified Identity Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Alumni <span className="text-slate-400 font-light">Network</span>
              </h1>
              <p className="text-slate-500 max-w-xl text-lg">
                Connect with the global UIU institutional network. Discover talent, mentor peers, and build professional bridges.
              </p>
            </div>

            <div className="w-full md:w-96 relative group">
               <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 focus-within:ring-2 focus-within:ring-[#f97316]/20 focus-within:border-[#f97316]/40 transition-all">
                  <div className="flex-1 flex items-center pl-4">
                     <Search className="text-slate-400" size={16} />
                     <input 
                       type="text" 
                       placeholder="Search by name, company, or role..." 
                       className="w-full bg-transparent border-none outline-none focus:ring-0 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD BODY */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* Filters Sidebar */}
           <aside className="lg:w-64 space-y-8 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                 <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                       <div className="flex items-center gap-2 text-slate-900">
                          <SlidersHorizontal size={14} className="text-[#f97316]" />
                          <h3 className="text-xs font-bold uppercase tracking-wider">Filter Results</h3>
                       </div>
                    </div>

                    <div className="p-5 space-y-8">
                       {categories.map((cat) => (
                         <div key={cat.title} className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{cat.title}</h4>
                            <div className="flex flex-col gap-2.5">
                               {cat.depts.map((dept) => (
                                 <label key={dept} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="relative flex items-center justify-center">
                                       <input 
                                         type="checkbox" 
                                         className="peer h-4 w-4 appearance-none border border-slate-300 rounded checked:border-[#f97316] checked:bg-[#f97316] transition-all cursor-pointer"
                                         checked={selectedDepts.includes(dept)}
                                         onChange={() => toggleDept(dept)}
                                       />
                                       <Check size={10} strokeWidth={4} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                                    </div>
                                    <span className={cn(
                                       "text-xs font-medium transition-colors",
                                       selectedDepts.includes(dept) ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                                    )}>
                                       {dept}
                                    </span>
                                 </label>
                               ))}
                            </div>
                         </div>
                       ))}
                       
                       <button 
                         onClick={() => setSelectedDepts([])} 
                         className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-slate-400 hover:text-[#f97316] transition-colors border-t border-slate-50 pt-4"
                       >
                          <RotateCcw size={12} />
                          Reset Filters
                       </button>
                    </div>
                 </div>
              </div>
           </aside>

           {/* Results Grid */}
           <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between text-slate-400 text-xs px-2">
                 <p className="font-medium">{filteredAlumni.length} professionals found</p>
                 <div className="flex items-center gap-2">
                    <span>Sort by:</span>
                    <select className="bg-transparent border-none text-slate-900 font-semibold focus:ring-0 cursor-pointer">
                       <option>Recent Activity</option>
                       <option>Batch Year</option>
                       <option>Full Name</option>
                    </select>
                 </div>
              </div>

              {filteredAlumni.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {filteredAlumni.map((person) => (
                      <div key={person.id} className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#f97316]/20 transition-all duration-300 flex flex-col overflow-hidden">
                         <div className="p-5 flex flex-col items-center text-center space-y-4 flex-1">
                            <Link href={`/dashboard/profile/${person.id}`} className="relative h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-xl font-bold text-slate-400 group-hover:text-[#f97316] group-hover:bg-orange-50 transition-all duration-300 overflow-hidden ring-2 ring-white shadow-sm border border-slate-100">
                               {person.name.charAt(0)}
                               <div className="absolute inset-0 bg-transparent transition-all"></div>
                            </Link>

                            <div className="space-y-1 w-full">
                               <Link href={`/dashboard/profile/${person.id}`} className="text-base font-bold text-slate-900 hover:text-[#f97316] transition-colors line-clamp-1">{person.name}</Link>
                               <p className="text-[11px] font-semibold text-[#f97316] px-2 line-clamp-1">{person.job}</p>
                               <p className="text-[10px] font-medium text-slate-400">{person.company}</p>
                            </div>

                            <div className="w-full pt-3 border-t border-slate-50 space-y-2">
                               <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                  <span className="flex items-center gap-1.5"><MapPin size={10} className="text-slate-300" /> {person.location}</span>
                                  <span className="bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-full text-slate-500 uppercase tracking-widest">{person.dept} {person.batch}</span>
                                </div>
                            </div>
                         </div>

                         <div className="p-2 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                            <Link 
                               href={`/dashboard/profile/${person.id}`}
                               className="flex-1 h-9 bg-white text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center active:scale-95 shadow-sm"
                            >
                               Profile
                            </Link>
                            {person.isConnected ? (
                              <div className="flex-1 h-9 bg-green-50 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center border border-green-100">
                                 Connected
                              </div>
                            ) : (
                              <button 
                                 onClick={() => toggleConnection(person.id)}
                                 className="flex-1 h-9 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-[#f97316] transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                              >
                                 <UserPlus size={12} /> Connect
                              </button>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl py-32 text-center shadow-sm">
                   <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 mb-6">
                     <Search size={32} className="text-slate-200" />
                   </div>
                   <h3 className="text-sm font-bold text-slate-900">No members found</h3>
                   <p className="text-slate-400 text-xs mt-2">Adjust your filters or try a different search term</p>
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
