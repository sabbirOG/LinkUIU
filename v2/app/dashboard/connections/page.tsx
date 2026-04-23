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
    <div className="min-h-screen bg-[#f8f9fb] font-sans">

      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-4">

          {/* Title row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-5">
            <div>
              <p className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <UserCheck size={12} strokeWidth={2.5} /> Professional Network
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-none">
                Connections <span className="text-slate-300 font-light">Hub</span>
              </h1>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 self-start md:self-auto w-full md:w-auto">
              <button
                onClick={() => { setActiveTab("my-network"); setSearchQuery(""); }}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "my-network" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                My Network
              </button>
              <button
                onClick={() => { setActiveTab("requests"); setSearchQuery(""); }}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  activeTab === "requests" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Requests
                {pendingRequests.length > 0 && (
                  <span className="h-5 min-w-[18px] px-1 bg-[#f97316] text-white rounded-full flex items-center justify-center text-[9px] font-black">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder={activeTab === "requests" ? "Search requests…" : "Search your network…"}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent focus:bg-white focus:border-[#f97316]/30 focus:ring-4 focus:ring-[#f97316]/5 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

        {/* ── REQUESTS TAB ─── */}
        {activeTab === "requests" ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Pending · {filteredData.length}
            </p>

            {filteredData.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {filteredData.map(req => (
                  <div key={req.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 hover:border-[#f97316]/20 transition-all shadow-sm">
                    {/* Avatar */}
                    <Link href={`/dashboard/profile/${req.id}`} className="relative shrink-0">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 hover:text-[#f97316] hover:bg-orange-50 transition-all">
                        {req.name.charAt(0)}
                      </div>
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/profile/${req.id}`} className="text-sm font-bold text-slate-900 hover:text-[#f97316] transition-colors leading-tight block truncate">
                        {req.name}
                      </Link>
                      <p className="text-[11px] font-semibold text-[#f97316] truncate">{req.job}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{req.dept} · Batch {req.batch}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => toggleConnection(req.id)}
                        className="h-8 w-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all"
                        title="Ignore"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => toggleConnection(req.id)}
                        className="h-8 px-3 rounded-lg bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Check size={13} /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                  <Check size={28} />
                </div>
                <p className="text-sm font-bold text-slate-900">All caught up</p>
                <p className="text-xs text-slate-400 font-medium mt-1">No pending requests at this time.</p>
              </div>
            )}
          </div>

        ) : (
          /* ── MY NETWORK TAB ─── */
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Your Network · {filteredData.length} Alumni
            </p>

            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredData.map(person => (
                  <div key={person.id} className="group bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#f97316]/20 transition-all duration-200">
                    {/* Card top */}
                    <div className="flex items-start gap-3 mb-4">
                      <Link href={`/dashboard/profile/${person.id}`} className="relative shrink-0">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 group-hover:text-[#f97316] group-hover:bg-orange-50 transition-all">
                          {person.name.charAt(0)}
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full" />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/dashboard/profile/${person.id}`} className="text-sm font-bold text-slate-900 hover:text-[#f97316] transition-colors leading-tight block truncate">
                          {person.name}
                        </Link>
                        <p className="text-[11px] font-semibold text-[#f97316] truncate">{person.job}</p>
                        <p className="text-[10px] font-medium text-slate-400 truncate">{person.company}</p>
                      </div>
                    </div>

                    {/* Dept + batch badge */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {person.dept}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Batch {person.batch}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/messages?chat=${person.id}`)}
                        className="flex-1 h-9 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare size={12} /> Message
                      </button>
                      <Link
                        href={`/dashboard/profile/${person.id}`}
                        className="flex-1 h-9 bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center shadow-md"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                  <Users size={28} />
                </div>
                <p className="text-sm font-bold text-slate-900">No connections found</p>
                <Link
                  href="/dashboard/directory"
                  className="mt-5 inline-flex px-6 py-2.5 bg-[#0f172a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  Explore Directory
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
