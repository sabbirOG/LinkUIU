"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  FileSearch, 
  LayoutGrid, 
  TrendingUp, 
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";

export default function ApplicationsPage() {
  const { applications, jobs, isLoaded } = useGlobalStore();

  const enrichedApplications = useMemo(() => {
    return applications.map(app => {
      const job = jobs.find(j => j.id === app.jobId);
      return {
        ...app,
        title: job?.title || "Unknown Position",
        company: job?.company || "Unknown Company",
        location: job?.location || "N/A",
      };
    });
  }, [applications, jobs]);

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'hired': return 'bg-green-50 text-green-600 border-green-100';
      case 'rejected': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-orange-50 text-[#f97316] border-orange-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'hired': return <CheckCircle2 size={12} />;
      case 'rejected': return <XCircle size={12} />;
      default: return <Clock3 size={12} />;
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Tracks...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans overflow-x-hidden pt-[64px]">
      
      {/* 1. ELITE FIXED HEADER FRAME */}
      <div className="fixed top-[64px] left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
             <div className="space-y-1">
               <div className="flex items-center gap-2 text-[#f97316] font-black uppercase tracking-[0.3em] text-[8px]">
                 <FileSearch size={10} className="stroke-[3px]" />
                 Institutional Career Tracking
               </div>
               <h1 className="text-3xl font-black tracking-tighter text-[#0f172a]">My <span className="text-slate-200">Applications</span></h1>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Status: <span className="text-[#0f172a]">{enrichedApplications.length} Tracks</span></p>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* 2. DASHBOARD BODY */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-[230px] pb-32">
        <div className="grid lg:grid-cols-12 gap-10">
           
           <div className="lg:col-span-9 space-y-4">
              {enrichedApplications.length > 0 ? (
                enrichedApplications.map(app => (
                  <div key={app.id} className="group bg-white border border-slate-100 p-8 rounded-[3rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 shadow-sm hover:border-[#f97316]/20 transition-all duration-500 overflow-hidden hover:-translate-y-1">
                    <div className="flex items-center gap-8">
                       <div className="h-16 w-16 bg-white border-2 border-slate-50 ring-4 ring-slate-100 rounded-[1.8rem] flex items-center justify-center text-[#f97316] group-hover:bg-[#f97316] group-hover:text-white transition-all duration-500 shadow-sm">
                          <Briefcase size={28} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-black text-[#0f172a] tracking-tight group-hover:text-[#f97316] transition-colors">{app.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                             <span className="text-[#f97316]">{app.company}</span>
                             <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-100" /> {app.location}</span>
                             <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-100" /> APPLIED {new Date(app.appliedAt).toLocaleDateString().toUpperCase()}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                       <div className={cn("px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border", getStatusStyle(app.status))}>
                          {getStatusIcon(app.status)}
                          {app.status}
                       </div>
                       <button className="h-12 w-12 flex items-center justify-center bg-slate-50 rounded-xl text-slate-200 hover:text-[#f97316] hover:bg-white transition-all border border-slate-100">
                          <ExternalLink size={18} />
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center space-y-4 bg-white border border-dashed border-slate-200 rounded-[3rem]">
                   <FileSearch size={48} className="mx-auto text-slate-100" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active career tracks found</p>
                   <Link href="/dashboard/jobs" className="inline-block text-[#f97316] text-[10px] font-black uppercase tracking-widest hover:underline">Browse Opportunities</Link>
                </div>
              )}
           </div>

           <aside className="lg:col-span-3">
              <div className="sticky top-[230px] space-y-6 self-start">
                 <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex items-center gap-2">
                       <LayoutGrid size={14} className="text-[#f97316]" />
                       <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#0f172a]">Command Stats</h3>
                    </div>
                    
                    <div className="p-8 space-y-6">
                       <div className="space-y-4">
                          <div className="flex justify-between items-center py-1">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-[#0f172a]"><TrendingUp size={14} /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applications</span>
                             </div>
                             <span className="text-sm font-black text-[#0f172a] tracking-tight">{enrichedApplications.length}</span>
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-50">
                          <button className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                             <ShieldCheck size={16} /> Secure Summary
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </aside>
        </div>
      </div>
    </div>
  );
}
