"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Check,
  X,
  Search,
  UserCheck,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";

export default function ConnectionsPage() {
  const { alumni, toggleConnection, isLoaded } = useGlobalStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-network");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingRequests = useMemo(() => alumni.filter(a => a.isRequest && !a.isConnected), [alumni]);
  const connectedNetwork = useMemo(() => alumni.filter(a => a.isConnected && !a.isSelf), [alumni]);

  const filteredData = useMemo(() => {
    const dataSource = activeTab === "requests" ? pendingRequests : connectedNetwork;
    return dataSource.filter(person =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.job || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.batch || "").includes(searchQuery)
    );
  }, [activeTab, searchQuery, pendingRequests, connectedNetwork]);

  if (!isLoaded) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[#f97316] mb-4" size={28} />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Network…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 pt-6 sm:pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Title row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-[#f97316] font-black text-[10px] uppercase tracking-widest">
                <Users size={14} strokeWidth={3} /> Professional Network
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                Connections <span className="text-slate-200 font-normal">Hub</span>
              </h1>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 self-start md:self-auto w-full md:w-auto">
              <button
                onClick={() => { setActiveTab("my-network"); setSearchQuery(""); }}
                className={cn(
                  "flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all",
                  activeTab === "my-network" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Network
              </button>
              <button
                onClick={() => { setActiveTab("requests"); setSearchQuery(""); }}
                className={cn(
                  "flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2",
                  activeTab === "requests" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Pulse
                {pendingRequests.length > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 bg-[#f97316] text-white rounded-full flex items-center justify-center text-[9px] font-black animate-pulse">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative group max-w-2xl mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f97316] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search your network..."
              className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#f97316]/20 focus:ring-4 focus:ring-[#f97316]/5 rounded-[24px] text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── REQUESTS TAB ─── */}
        {activeTab === "requests" ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
              Pending Authorization · {filteredData.length}
            </p>

            {filteredData.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredData.map(req => (
                  <div key={req.id} className="group bg-white border border-slate-200 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-[#f97316]/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    {/* Avatar */}
                    <Link href={`/dashboard/profile/${req.id}`} className="relative shrink-0">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-300 group-hover:text-white group-hover:bg-[#f97316] transition-all duration-300 border border-slate-100 shadow-inner">
                        {req.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-orange-500 border-4 border-white rounded-full animate-pulse" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/profile/${req.id}`} className="text-lg font-black text-slate-900 hover:text-[#f97316] transition-colors leading-tight block truncate tracking-tight">
                        {req.name}
                      </Link>
                      <p className="text-[11px] font-black text-[#f97316] uppercase tracking-widest mt-1 truncate">{req.job}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                         <span>{req.dept}</span>
                         <span className="opacity-30">•</span>
                         <span>Batch {req.batch}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                      <button
                        onClick={() => toggleConnection(req.id)}
                        className="flex-1 sm:flex-none h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all border border-slate-100"
                        title="Decline"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={() => toggleConnection(req.id)}
                        className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#f97316] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                      >
                        <Check size={16} /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[40px] shadow-sm">
                <div className="h-20 w-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mx-auto mb-6">
                  <UserCheck size={32} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Queue Empty</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">No pending signals detected.</p>
              </div>
            )}
          </div>

        ) : (
          /* ── MY NETWORK TAB ─── */
          <div className="space-y-6 animate-in fade-in duration-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
               YOUR NETWORK - {connectedNetwork.length} ALUMNI
            </p>

            {connectedNetwork.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {connectedNetwork.map(person => (
                  <div key={person.id} className="group bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:border-[#f97316]/30 transition-all duration-500">
                    {/* Card top */}
                    <div className="flex items-start gap-4 mb-6">
                      <Link href={`/dashboard/profile/${person.id}`} className="relative shrink-0">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-300 group-hover:text-white group-hover:bg-[#f97316] transition-all duration-500 border border-slate-100">
                          {person.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-4 border-white rounded-full" />
                      </Link>
                      <div className="min-w-0 pt-1">
                        <Link href={`/dashboard/profile/${person.id}`} className="text-[15px] font-black text-slate-900 hover:text-[#f97316] transition-colors leading-tight block truncate tracking-tight">
                          {person.name}
                        </Link>
                        <p className="text-[10px] font-black text-[#f97316] uppercase tracking-widest mt-1 truncate">{person.job}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5 tracking-tight">{person.company}</p>
                      </div>
                    </div>

                    {/* Dept + batch badge */}
                    <div className="flex items-center gap-1.5 mb-8">
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        {person.dept}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        '{person.batch?.slice(-2) || "XX"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/messages?chat=${person.id}`)}
                        className="flex-1 h-11 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:border-[#f97316]/20 hover:text-[#f97316] transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <MessageSquare size={14} /> Msg
                      </button>
                      <Link
                        href={`/dashboard/profile/${person.id}`}
                        className="flex-1 h-11 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#f97316] transition-all flex items-center justify-center shadow-lg active:scale-95"
                      >
                        Portal
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center">
                 <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                    <Users size={28} />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 mb-6">No connections found</h3>
                 <Link
                   href="/dashboard/directory"
                   className="h-12 px-10 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#f97316] transition-all flex items-center justify-center shadow-xl shadow-slate-200 active:scale-95"
                 >
                   EXPLORE DIRECTORY
                 </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
