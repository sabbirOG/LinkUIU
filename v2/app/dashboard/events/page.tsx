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
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
      
      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
            <div>
              <p className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <CalendarDays size={12} strokeWidth={2.5} /> Institutional Calendar
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-none">
                Events <span className="text-slate-300 font-light">Hub</span>
              </h1>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
              {["upcoming", "past", "all"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-sm border-transparent"
                      : "text-slate-400 hover:text-slate-600 border border-transparent"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search active events or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent outline-none focus:bg-white focus:border-[#f97316]/30 focus:ring-4 focus:ring-[#f97316]/5 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── DASHBOARD BODY ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">
          {filteredEvents.length} Activities Found
        </p>

        {filteredEvents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#f97316]/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center h-20 w-20 shrink-0 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:bg-orange-50 group-hover:text-[#f97316] group-hover:border-orange-100 transition-all duration-300">
                    <span className="text-2xl font-black leading-none">{event.day}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{event.month}</span>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#f97316] transition-colors line-clamp-1 pr-4">
                           {event.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border",
                            event.status === "upcoming" ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                             {event.status}
                          </span>
                          <span className="px-2.5 py-1 bg-orange-50 text-[#f97316] rounded-md text-[9px] font-bold uppercase tracking-widest border border-orange-100 hidden sm:inline-flex">
                             {event.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-400 mt-2">
                         <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-300" /> {event.time}</span>
                         <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-300" /> {event.location}</span>
                         <span className="flex items-center gap-1.5"><Users size={13} className="text-slate-300" /> {event.attendees + (event.isJoined ? 1 : 0)} Attending</span>
                      </div>
                      
                      <p className="text-[13px] font-medium text-slate-500 mt-4 line-clamp-2 pr-4 md:pr-0">
                         {event.desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 pt-4 md:pt-0 border-t border-slate-50 md:border-none w-full md:w-48">
                    {event.status === "upcoming" ? (
                      <>
                         {event.isJoined ? (
                           <button className="flex-1 md:flex-none h-10 w-full bg-green-50 text-green-600 font-bold uppercase tracking-wider text-[10px] rounded-lg border border-green-100 flex items-center justify-center gap-2 cursor-default">
                              <Check size={14} /> Registered
                           </button>
                         ) : (
                           <button 
                             onClick={() => joinEvent(event.id)}
                             className="flex-1 md:flex-none h-10 w-full bg-[#0f172a] text-white font-bold uppercase tracking-wider text-[10px] rounded-lg hover:bg-[#f97316] transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                           >
                              Reserve Spot
                           </button>
                         )}
                         <button 
                             onClick={() => setSelectedEvent(event)}
                             className="flex-1 md:flex-none h-10 w-full bg-white border border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center"
                         >
                            Full Details
                         </button>
                      </>
                    ) : (
                       <button className="flex-1 md:flex-none h-10 w-full bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] rounded-lg border border-slate-200 cursor-not-allowed flex items-center justify-center">
                          Event Ended
                       </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
             <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-5 border border-slate-100">
                <CalendarDays size={32} />
             </div>
             <h3 className="text-sm font-bold text-slate-900">No events found</h3>
             <p className="text-xs text-slate-400 font-medium mt-1">Check back later or adjust your search.</p>
          </div>
        )}
      </div>

      {/* ── EVENT DETAILS MODAL ─────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative block">
             <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Event Briefing</p>
                <button 
                   onClick={() => setSelectedEvent(null)}
                   className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors"
                >
                   <X size={16} />
                </button>
             </div>
             
             <div className="p-8">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                   <div className="h-24 w-24 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-3xl font-black text-[#0f172a]">{selectedEvent.day}</span>
                      <span className="text-[11px] font-bold text-[#f97316] uppercase tracking-widest">{selectedEvent.month}</span>
                   </div>
                   <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] tracking-tight leading-tight mb-3">
                         {selectedEvent.title}
                      </h2>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                         <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Clock size={13} className="text-[#f97316]" /> {selectedEvent.time}</span>
                         <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><MapPin size={13} className="text-[#f97316]" /> {selectedEvent.location}</span>
                      </div>
                   </div>
                </div>

                <div className="prose prose-sm max-w-none text-slate-600 mb-10">
                   <p className="text-base font-medium leading-relaxed">{selectedEvent.desc}</p>
                   {/* In a real scenario, this would have more details, itinerary, speakers, etc. */}
                   <p className="mt-4 p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-sm italic text-slate-700">
                     "This event will be an excellent opportunity for professional networking. Attire is strictly smart casual."
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                   {selectedEvent.status === "upcoming" ? (
                      selectedEvent.isJoined ? (
                         <div className="flex-1 h-12 bg-green-50 text-green-600 font-bold uppercase tracking-wider text-[11px] rounded-xl border border-green-100 flex items-center justify-center gap-2">
                            <Check size={16} /> Admission Confirmed
                         </div>
                      ) : (
                         <button 
                            onClick={() => { joinEvent(selectedEvent.id); setSelectedEvent({ ...selectedEvent, isJoined: true }) }}
                            className="flex-1 h-12 bg-[#0f172a] hover:bg-[#f97316] text-white font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                         >
                            Reserve Spot <ArrowUpRight size={14} />
                         </button>
                      )
                   ) : (
                      <div className="flex-1 h-12 bg-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center">
                         Event Ended
                      </div>
                   )}
                   <button 
                     onClick={() => setSelectedEvent(null)}
                     className="flex-1 sm:max-w-[150px] h-12 bg-white border border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] rounded-xl hover:bg-slate-50 transition-all"
                   >
                     Close
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
