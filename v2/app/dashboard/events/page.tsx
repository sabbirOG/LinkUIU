"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  ChevronRight,
  CalendarDays,
  Target,
  ArrowUpRight,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";

export default function EventsPage() {
  const { events: storeEvents, joinEvent, isLoaded } = useGlobalStore();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const filteredEvents = useMemo(() => {
    return storeEvents.filter((e) => {
      const matchesTab = activeTab === "all" || e.status === activeTab;
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [storeEvents, activeTab, searchQuery]);

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Schedule...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      
      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-[#f97316] font-black text-[10px] uppercase tracking-widest">
                <CalendarDays size={14} strokeWidth={3} /> Institutional Calendar
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                Events <span className="text-slate-200 font-normal">Hub</span>
              </h1>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-[16px] w-full md:w-auto overflow-x-auto no-scrollbar gap-1">
              {["upcoming", "past", "all"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 md:flex-none px-8 py-3 rounded-[12px] text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f97316] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search active events or keywords..."
              className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#f97316]/20 focus:ring-4 focus:ring-[#f97316]/5 rounded-[24px] text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── DASHBOARD BODY ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">
          {filteredEvents.length} ACTIVITIES FOUND
        </p>

        {filteredEvents.length > 0 ? (
          <div className="flex flex-col gap-4 sm:gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:border-[#f97316]/30 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  
                  {/* Date Block */}
                  <div className="flex md:flex-col items-center justify-center h-16 w-full md:h-24 md:w-24 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl text-slate-300 group-hover:bg-[#f97316] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-inner">
                    <span className="text-3xl font-black leading-none tracking-tighter">{event.day}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 ml-2 md:ml-0">{event.month}</span>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between pt-1">
                    <div>
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#f97316] transition-colors tracking-tight leading-tight mb-2 pr-8">
                             {event.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                              event.status === "upcoming" ? "bg-green-50 text-green-600 border-green-100/50" : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                               {event.status}
                            </span>
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                               {event.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                         <span className="flex items-center gap-2"><Clock size={14} className="text-[#f97316]" /> {event.time}</span>
                         <span className="flex items-center gap-2"><MapPin size={14} className="text-[#f97316]" /> {event.location}</span>
                         <span className="flex items-center gap-2"><Users size={14} className="text-[#f97316]" /> {event.attendees + (event.isJoined ? 1 : 0)} Participants</span>
                      </div>
                      
                      <p className="text-[15px] font-medium text-slate-500 mt-6 leading-relaxed line-clamp-2 max-w-2xl">
                         {event.desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0 pt-8 md:pt-0 border-t md:border-t-0 border-slate-50 w-full md:w-56 justify-center">
                    {event.status === "upcoming" ? (
                      <>
                         {event.isJoined ? (
                           <div className="h-14 w-full bg-slate-50 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                              <Check size={16} className="text-green-500" strokeWidth={3} /> Signal Acquired
                           </div>
                         ) : (
                           <button 
                             onClick={() => joinEvent(event.id)}
                             className="h-14 w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#f97316] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-slate-200"
                           >
                              Initialize Entry
                           </button>
                         )}
                         <button 
                             onClick={() => setSelectedEvent(event)}
                             className="h-14 w-full bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:border-[#f97316]/20 hover:text-[#f97316] transition-all flex items-center justify-center active:scale-95"
                         >
                            Protocol Intel
                         </button>
                      </>
                    ) : (
                       <div className="h-14 w-full bg-slate-50 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-slate-100 flex items-center justify-center opacity-60">
                          Timeline Closed
                       </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center">
             <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                <CalendarDays size={28} />
             </div>
             <h3 className="text-lg font-black text-slate-900">Timeline Zero</h3>
             <p className="text-sm text-slate-400 font-medium mt-1">No active vectors detected in this sector.</p>
          </div>
        )}
      </div>

      {/* ── EVENT DETAILS MODAL ─────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative block no-scrollbar">
             <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-50 p-6 flex justify-between items-center z-10">
                <p className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.2em] px-2">Operational Intel</p>
                <button 
                   onClick={() => setSelectedEvent(null)}
                   className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all active:scale-90"
                >
                   <X size={20} />
                </button>
             </div>
             
             <div className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row gap-8 mb-10">
                   <div className="h-24 w-24 rounded-[32px] bg-slate-900 flex flex-col items-center justify-center shrink-0 shadow-2xl shadow-slate-200">
                      <span className="text-3xl font-black text-[#f97316] tracking-tighter">{selectedEvent.day}</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{selectedEvent.month}</span>
                   </div>
                   <div className="pt-2">
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                         {selectedEvent.title}
                      </h2>
                      <div className="flex flex-wrap gap-3">
                         <span className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={14} className="text-[#f97316]" /> {selectedEvent.time}</span>
                         <span className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500"><MapPin size={14} className="text-[#f97316]" /> {selectedEvent.location}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 text-slate-600 mb-12">
                   <p className="text-lg font-bold leading-relaxed text-slate-900 italic opacity-80 border-l-4 border-[#f97316] pl-6">{selectedEvent.desc}</p>
                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-[28px] text-[13px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                     This institutional gathering requires verified credentials. All participants are encouraged to arrive 15 minutes prior to the scheduled timeline for secure identification.
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-slate-50">
                   {selectedEvent.status === "upcoming" ? (
                      selectedEvent.isJoined ? (
                         <div className="flex-1 h-14 bg-green-50 text-green-600 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-green-100 flex items-center justify-center gap-3">
                            <Check size={18} strokeWidth={3} /> Authorization Confirmed
                         </div>
                      ) : (
                         <button 
                            onClick={() => { joinEvent(selectedEvent.id); setSelectedEvent({ ...selectedEvent, isJoined: true }) }}
                            className="flex-1 h-14 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#f97316] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200"
                         >
                            Initialize Registration <ArrowUpRight size={16} />
                         </button>
                      )
                   ) : (
                      <div className="flex-1 h-14 bg-slate-50 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center">
                         Timeline Expired
                      </div>
                   )}
                   <button 
                     onClick={() => setSelectedEvent(null)}
                     className="flex-1 sm:max-w-[150px] h-14 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                   >
                     Withdraw
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
