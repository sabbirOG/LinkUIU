"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X, Search, User, Briefcase, Calendar, ArrowRight, History, Command } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalStore } from "@/lib/store";

const navLinks = [
  { name: "Pulse Feed", href: "/dashboard" },
  { name: "Jobs", href: "/dashboard/jobs" },
  { name: "Connect", href: "/dashboard/connections" },
  { name: "Directory", href: "/dashboard/directory" },
  { name: "Messages", href: "/dashboard/messages" },
  { name: "Notifications", href: "/dashboard/notifications" },
  { name: "Events", href: "/dashboard/events" },
  { name: "Profile", href: "/dashboard/profile/self" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { alumni, jobs, events } = useGlobalStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Physical Search Logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { alumni: [], jobs: [], events: [] };
    const q = searchQuery.toLowerCase();
    return {
      alumni: alumni.filter(a => a.name.toLowerCase().includes(q) || (a.dept?.toLowerCase() || "").includes(q)).slice(0, 3) as any[],
      jobs: jobs.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)).slice(0, 3) as any[],
      events: events.filter(e => e.title.toLowerCase().includes(q)).slice(0, 3) as any[]
    };
  }, [searchQuery, alumni, jobs, events]);

  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== "/") {
        setIsScrolled(true);
      } else {
        setIsScrolled(window.scrollY > 20);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Command-K Shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left Side: Logo Duo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            <img 
              src="/assets/images/uiu_logo.png" 
              alt="UIU" 
              className={cn(
                "h-8 transition-all duration-300",
                !isScrolled && "brightness-0 invert"
              )} 
            />
            <div className={cn("w-px h-6 transition-colors duration-300", isScrolled ? "bg-slate-200" : "bg-white/20")}></div>
            <img 
              src="/assets/images/linkuiu_logo.png" 
              alt="LinkUIU" 
              className={cn(
                "h-5 transition-all duration-300",
                !isScrolled && "brightness-0 invert"
              )} 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 text-sm">
            {navLinks.slice(1, 8).map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={cn(
                    "px-4 py-2 font-bold transition-all text-sm uppercase tracking-widest",
                    isActive 
                      ? (isScrolled ? "text-[#f97316]" : "text-white")
                      : (isScrolled ? "text-slate-400 hover:text-slate-900" : "text-white/50 hover:text-white")
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Search & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Professional Search Trigger */}
          <button 
            onClick={() => setSearchOpen(true)}
            className={cn(
              "hidden md:flex items-center gap-3 px-3 py-1.5 border rounded-lg transition-all duration-200 group",
              isScrolled 
                ? "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300" 
                : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20"
            )}
          >
            <Search size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium lg:inline hidden">Quick Search</span>
            <div className={cn(
              "h-5 px-1.5 rounded flex items-center justify-center text-[10px] font-medium border",
              isScrolled ? "bg-white border-slate-200 text-slate-400" : "bg-black/20 border-white/10 text-white/40"
            )}>
              <Command size={10} className="mr-1" /> K
            </div>
          </button>

          <Link 
            href="/dashboard"
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95",
              isScrolled 
                ? "bg-slate-900 text-white hover:bg-slate-800" 
                : "bg-white text-[#f97316] hover:shadow-lg"
            )}
          >
            Enter Feed
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn("lg:hidden p-2 transition-colors", isScrolled ? "text-slate-900" : "text-white")}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Global Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center p-5 border-b border-slate-100">
               <Search className="text-slate-400" size={18} />
               <input 
                 autoFocus
                 type="text" 
                 placeholder="Search the network..." 
                 className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-base font-normal text-slate-900 placeholder:text-slate-300"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
               />
               <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-sans text-[10px] font-medium text-slate-400 opacity-100">
                 ESC
               </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
               {!searchQuery ? (
                 <div className="py-12 text-center text-slate-400 space-y-3">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <History size={20} className="opacity-40" />
                    </div>
                    <p className="text-sm font-medium">Search for alumni, jobs, or events</p>
                 </div>
               ) : (
                 <div className="space-y-4 p-2">
                    {/* Alumni Results */}
                    {searchResults.alumni.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
                           People
                        </h4>
                        <div className="space-y-1">
                           {searchResults.alumni.map(person => (
                             <button key={person.id} onClick={() => { router.push(`/dashboard/profile/${person.id}`); setSearchOpen(false); }} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center font-bold text-[#f97316] group-hover:bg-[#f97316] group-hover:text-white transition-all">{person.name.charAt(0)}</div>
                                   <div className="text-left">
                                      <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                                      <p className="text-xs text-slate-500">{person.job} at {person.company}</p>
                                   </div>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                             </button>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* Job Results */}
                    {searchResults.jobs.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
                           Jobs
                        </h4>
                        <div className="space-y-1">
                           {searchResults.jobs.map(job => (
                             <button key={job.id} onClick={() => { router.push(`/dashboard/jobs`); setSearchOpen(false); }} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-[#f97316] transition-all"><Briefcase size={16} /></div>
                                   <div className="text-left">
                                      <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                                      <p className="text-xs text-slate-500">{job.company} · {job.type}</p>
                                   </div>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                             </button>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* No Results Fallback */}
                    {searchResults.alumni.length === 0 && searchResults.jobs.length === 0 && searchResults.events.length === 0 && (
                      <div className="py-12 text-center text-slate-300">
                         <p className="text-sm font-medium">No results found in the network</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
            
            <div className="bg-slate-50 px-5 py-3 flex items-center justify-between border-t border-slate-100 text-[10px] font-medium text-slate-400">
               <div className="flex gap-4">
                 <span className="flex items-center gap-1.5 mb-0"><kbd className="bg-white border px-1 rounded">↑↓</kbd> Navigate</span>
                 <span className="flex items-center gap-1.5 mb-0"><kbd className="bg-white border px-1 rounded">↵</kbd> Select</span>
               </div>
               <span className="font-semibold text-slate-300 uppercase tracking-tighter">LinkUIU v2.0 Professional</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-white z-[60] flex flex-col p-6 space-y-4 animate-in slide-in-from-right duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-900 border-b border-slate-50 pb-4 flex items-center justify-between"
            >
              {link.name}
              <ArrowRight size={18} className="text-[#f97316]" />
            </Link>
          ))}
          <Link 
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full bg-slate-900 text-white text-center font-semibold py-4 rounded-xl mt-4"
          >
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
}
