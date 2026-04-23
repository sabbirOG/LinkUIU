"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X, Search, User, Briefcase, Calendar, ArrowRight, History, Command, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalStore } from "@/lib/store";

const navLinks = [
  { name: "Activity Feed", href: "/dashboard" },
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
  const { alumni, jobs, events, signOut } = useGlobalStore();
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
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          isScrolled 
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/60 py-3 shadow-sm" 
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
                alt="LinkedUIU" 
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
                      "px-4 py-2 font-black transition-all text-[10px] uppercase tracking-[0.2em]",
                      isActive 
                        ? (isScrolled ? "text-[#f97316]" : "text-[#f97316]")
                        : (isScrolled ? "text-slate-400 hover:text-slate-900" : "text-white/70 hover:text-white")
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
                "hidden md:flex items-center gap-3 px-4 py-2 border rounded-xl transition-all duration-300 group",
                isScrolled 
                  ? "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300" 
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <Search size={14} className="group-hover:scale-110 transition-transform text-[#f97316]" />
              <span className="text-[10px] font-black uppercase tracking-widest lg:inline hidden">Search Node</span>
              <div className={cn(
                "h-5 px-1.5 rounded flex items-center justify-center text-[10px] font-black border",
                isScrolled ? "bg-white border-slate-200 text-slate-300" : "bg-black/20 border-white/10 text-white/20"
              )}>
                <Command size={10} className="mr-1" /> K
              </div>
            </button>

            <Link 
              href="/dashboard"
              className={cn(
                "hidden sm:flex px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                isScrolled 
                  ? "bg-slate-900 text-white hover:bg-black" 
                  : "bg-[#f97316] text-white hover:shadow-orange-500/20"
              )}
            >
              Enter Feed
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden h-10 w-10 flex items-center justify-center rounded-xl transition-all border shrink-0",
                isScrolled 
                  ? "bg-white text-slate-900 border-slate-200 shadow-sm" 
                  : "bg-white/10 text-white border-white/20",
                mobileMenuOpen && "bg-[#f97316] text-white border-transparent"
              )}
            >
              {mobileMenuOpen ? <X size={18} strokeWidth={3} /> : <Menu size={18} strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Global Search Overlay */}
        {searchOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSearchOpen(false)}>
            <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center p-6 border-b border-slate-50">
                 <Search className="text-[#f97316]" size={20} strokeWidth={3} />
                 <input 
                   autoFocus
                   type="text" 
                   placeholder="INITIALIZE SIGNAL SEARCH..." 
                   className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm font-black uppercase tracking-[0.1em] text-slate-900 placeholder:text-slate-200"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                 />
                 <kbd className="hidden sm:inline-flex h-7 items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 font-black text-[10px] text-slate-300">
                   ESC
                 </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 no-scrollbar">
                 {!searchQuery ? (
                   <div className="py-16 text-center space-y-4">
                      <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-dashed border-slate-200">
                        <History size={24} className="text-slate-200" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Awaiting Signal Query</p>
                   </div>
                 ) : (
                   <div className="space-y-6 p-2">
                      {/* Alumni Results */}
                      {searchResults.alumni.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#f97316] px-3 mb-3">
                             Detected Nodes
                          </h4>
                          <div className="space-y-2">
                             {searchResults.alumni.map(person => (
                               <button key={person.id} onClick={() => { router.push(`/dashboard/profile/${person.id}`); setSearchOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                  <div className="flex items-center gap-4">
                                     <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white group-hover:bg-[#f97316] transition-all">{person.name.charAt(0)}</div>
                                     <div className="text-left">
                                        <p className="text-sm font-black text-slate-900 tracking-tight">{person.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{person.job} · {person.company}</p>
                                     </div>
                                  </div>
                                  <ArrowRight size={16} className="text-slate-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                               </button>
                             ))}
                          </div>
                        </div>
                      )}

                      {/* Job Results */}
                      {searchResults.jobs.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#f97316] px-3 mb-3">
                             Career Vectors
                          </h4>
                          <div className="space-y-2">
                             {searchResults.jobs.map(job => (
                               <button key={job.id} onClick={() => { router.push(`/dashboard/jobs`); setSearchOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                  <div className="flex items-center gap-4">
                                     <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-orange-50 group-hover:text-[#f97316] transition-all"><Briefcase size={20} /></div>
                                     <div className="text-left">
                                        <p className="text-sm font-black text-slate-900 tracking-tight">{job.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{job.company} · {job.type}</p>
                                     </div>
                                  </div>
                                  <ArrowRight size={16} className="text-slate-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                               </button>
                             ))}
                          </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>
              
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                 <div className="flex gap-6">
                   <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300"><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-400">↑↓</kbd> NAVIGATE</span>
                   <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300"><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-400">↵</kbd> SELECT</span>
                 </div>
                 <span className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.4em]">Node Search v2.0</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay - Moved outside header for proper isolation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-y-auto animate-in fade-in duration-300">
          {/* Header inside Menu */}
          <div className="flex items-center justify-between p-5 border-b border-slate-50 shrink-0">
             <div className="flex items-center gap-3">
               <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-6" />
               <div className="w-px h-4 bg-slate-200"></div>
               <img src="/assets/images/linkuiu_logo.png" alt="LinkedUIU" className="h-4" />
             </div>
             <button 
               onClick={() => setMobileMenuOpen(false)} 
               className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
             >
                <X size={20} strokeWidth={3} />
             </button>
          </div>
          
          {/* Links Section */}
          <div className="flex-1 px-8 py-16 bg-white">
            <div className="space-y-8">
              {[
                { name: "Activity Feed", href: "/dashboard", icon: <Command size={18} /> },
                { name: "Jobs Hub", href: "/dashboard/jobs", icon: <Briefcase size={18} /> },
                { name: "Connections", href: "/dashboard/connections", icon: <User size={18} /> },
                { name: "Alumni Directory", href: "/dashboard/directory", icon: <Search size={18} /> },
                { name: "Messages", href: "/dashboard/messages", icon: <History size={18} /> },
                { name: "Institutional Events", href: "/dashboard/events", icon: <Calendar size={18} /> },
              ].map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-6 transition-all duration-300",
                      isActive ? "text-[#f97316]" : "text-slate-400 hover:text-slate-900"
                    )}
                  >
                    <div className="shrink-0">{link.icon}</div>
                    <span className={cn(
                      "text-lg tracking-tight font-medium",
                      isActive ? "text-slate-900" : ""
                    )}>
                      {link.name}
                    </span>
                    {isActive && (
                      <div className="h-1 w-1 bg-[#f97316] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Footer Section */}
          <div className="p-8 border-t border-slate-50 bg-white space-y-4">
            <Link 
              href="/dashboard/profile/self"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full p-5 rounded-2xl border border-slate-100 hover:border-[#f97316]/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <span className="text-sm font-bold text-slate-900">Identity Portal</span>
              </div>
              <ArrowRight size={16} className="text-slate-200 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all" />
            </Link>

            <button 
              onClick={async () => {
                setMobileMenuOpen(false);
                await signOut();
              }}
              className="flex items-center justify-center gap-3 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={14} strokeWidth={3} /> Sign Out Institutional Session
            </button>
          </div>
        </div>
      )}
    </>
  );
}
