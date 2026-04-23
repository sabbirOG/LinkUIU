"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  UserPlus, 
  ShieldCheck, 
  ChevronRight, 
  Target, 
  TrendingUp,
  Clock,
  MessageSquare,
  Share2,
  Calendar,
  MoreHorizontal,
  Send,
  Loader2,
  MapPin,
  Bookmark
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";

export default function DashboardHome() {
  const { activityFeed, currentUser, isLoaded, addPost } = useGlobalStore();
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setIsPosting(true);
    await addPost(postContent);
    setPostContent("");
    setIsPosting(false);
  };

  if (!isLoaded || !currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#f97316] rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Initialising Session</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        
        {/* LEFT COLUMN: Profile Summary (Desktop Only) */}
        <aside className="lg:w-[280px] flex-shrink-0 space-y-6 hidden lg:block">
           <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-20 bg-slate-100/80 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="px-6 pb-6 -mt-10 relative">
                 <div className="h-20 w-20 bg-white rounded-2xl p-1.5 shadow-md mx-auto border border-slate-100">
                    <div className="h-full w-full bg-slate-50 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-300">
                       {currentUser.name.charAt(0)}
                    </div>
                 </div>
                 <div className="mt-4 text-center">
                    <h2 className="font-bold text-lg text-slate-900 tracking-tight">{currentUser.name}</h2>
                    <p className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mt-1">{currentUser.job}</p>
                 </div>
                 
                 <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="font-bold text-slate-400 uppercase tracking-wider">Network</span>
                       <span className="font-black text-slate-900">1.2k</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="font-bold text-slate-400 uppercase tracking-wider">Identity</span>
                       <span className="flex items-center gap-1 font-black text-green-600">
                          <ShieldCheck size={12} /> Verified
                       </span>
                    </div>
                 </div>
              </div>
              <Link href="/dashboard/profile/self" className="flex items-center justify-center py-4 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-[10px] font-black text-slate-500 hover:text-slate-900 transition-all uppercase tracking-[0.15em]">
                 View Portal
              </Link>
           </div>

           <div className="bg-orange-50/50 border border-orange-100/50 p-5 rounded-2xl">
              <h4 className="text-[10px] font-black text-[#f97316] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Target size={14}/> Mission Status
              </h4>
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                Your institutional footprint is <span className="text-slate-900 font-bold">Strong</span>. 
                Keep engaging to unlock premium networking opportunities.
              </p>
           </div>
        </aside>

        {/* MAIN FEED */}
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-4 sm:space-y-6">
           
           {/* Mobile Quick Stats (Mobile Only) */}
           <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <div className="flex-shrink-0 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-3">
                 <div className="h-8 w-8 bg-orange-50 text-[#f97316] rounded-lg flex items-center justify-center"><Users size={16} /></div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Network</p>
                    <p className="text-xs font-bold text-slate-900">1.2k</p>
                 </div>
              </div>
              <div className="flex-shrink-0 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-3">
                 <div className="h-8 w-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><Briefcase size={16} /></div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Jobs</p>
                    <p className="text-xs font-bold text-slate-900">42 New</p>
                 </div>
              </div>
              <div className="flex-shrink-0 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-3">
                 <div className="h-8 w-8 bg-green-50 text-green-500 rounded-lg flex items-center justify-center"><Calendar size={16} /></div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Events</p>
                    <p className="text-xs font-bold text-slate-900">3 Today</p>
                 </div>
              </div>
           </div>

           {/* Post Input - Optimized Touch Targets */}
           <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm">
              <form onSubmit={handleCreatePost} className="flex gap-4">
                 <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-300 font-bold border border-slate-100 hidden sm:flex">
                    {currentUser.name.charAt(0)}
                 </div>
                 <div className="flex-1 space-y-3">
                    <textarea 
                      rows={1}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share a professional update..." 
                      className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#f97316]/20 focus:ring-4 focus:ring-[#f97316]/5 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all outline-none resize-none min-h-[52px]"
                    />
                    {postContent.trim() && (
                       <div className="flex justify-end animate-in slide-in-from-top-2 duration-300">
                          <button 
                            disabled={isPosting}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all disabled:opacity-50 hover:bg-[#f97316] active:scale-95 shadow-md shadow-slate-200"
                          >
                             {isPosting ? <Loader2 size={14} className="animate-spin" /> : "Publish Post"}
                          </button>
                       </div>
                    )}
                 </div>
              </form>
           </div>

           {/* Ranked Stream - Professional Card Treatment */}
           <div className="space-y-4 sm:space-y-6">
              {activityFeed.map((item) => (
                 <div key={item.feedId} className="group bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:border-[#f97316]/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-5">
                       <div className="flex items-center gap-3 sm:gap-4">
                          <Link href={`/dashboard/profile/${item.author?.id || item.postedBy?.id}`} className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-300 border border-slate-100 hover:border-[#f97316]/30 transition-all overflow-hidden text-sm sm:text-base">
                             {item.author?.name?.charAt(0) || item.company?.charAt(0)}
                          </Link>
                          <div>
                             <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                <Link href="#" className="font-bold text-[15px] text-slate-900 hover:text-[#f97316] transition-colors leading-none">{item.author?.name || item.company}</Link>
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border leading-none",
                                  item.type === 'job' ? 'bg-orange-50 text-[#f97316] border-orange-100' : 
                                  item.type === 'event' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                )}>
                                   {item.type}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span className="truncate max-w-[120px] sm:max-w-none">{item.author?.dept || 'Institutional Partner'}</span>
                                <span className="opacity-30">•</span>
                                <span>{formatRelativeTime(item.createdAt)}</span>
                             </div>
                          </div>
                       </div>
                       <button className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-50"><MoreHorizontal size={20} /></button>
                    </div>

                    <div className="space-y-4">
                       {item.type === 'job' && (
                          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 group/job">
                             <h5 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover/job:text-[#f97316] transition-colors">{item.title}</h5>
                             <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#f97316] uppercase tracking-widest"><TrendingUp size={12} /> {item.salary}</div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><MapPin size={12} /> Dhaka, BD</div>
                             </div>
                             <p className="text-[13px] sm:text-sm font-medium text-slate-600 leading-relaxed mb-5 line-clamp-3">{item.description}</p>
                             <Link href="/dashboard/jobs" className="inline-flex h-11 w-full sm:w-auto px-8 bg-slate-900 text-white rounded-xl items-center justify-center text-[10px] font-black uppercase tracking-[0.15em] hover:bg-[#f97316] transition-all shadow-lg shadow-slate-200 hover:shadow-[#f97316]/20">Apply Now</Link>
                          </div>
                       )}

                       {item.type === 'event' && (
                          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col sm:flex-row gap-5 sm:items-center">
                             <div className="shrink-0 h-16 w-16 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[10px] font-black text-[#f97316] uppercase tracking-widest leading-none mb-1.5">{item.month}</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">{item.day}</span>
                             </div>
                             <div className="flex-1">
                                <h5 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{item.title}</h5>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#f97316]" /> {item.time}</span>
                                   <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#f97316]" /> {item.location}</span>
                                </div>
                             </div>
                          </div>
                       )}

                       {item.type === 'post' && (
                          <div className="relative">
                             <p className="text-[15px] sm:text-base font-medium text-slate-700 leading-relaxed pl-5 border-l-4 border-orange-200">
                                {item.content}
                             </p>
                          </div>
                       )}
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-4 sm:gap-6">
                          <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.1em]">
                             <TrendingUp size={16} /> <span className="hidden sm:inline">Insights</span>
                          </button>
                          <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.1em]">
                             <MessageSquare size={16} /> 12 <span className="hidden sm:inline">Comments</span>
                          </button>
                       </div>
                       <div className="flex gap-2 sm:gap-4">
                          <button className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><Bookmark size={20} /></button>
                          <button className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><Share2 size={20} /></button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* RIGHT COLUMN: Trending (Desktop Only) */}
        <aside className="lg:w-[320px] flex-shrink-0 space-y-6 hidden xl:block">
           <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Career Insights</h3>
                 <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-6">
                 {activityFeed.filter(i => i.type === 'job').slice(0, 3).map(job => (
                    <div key={job.feedId} className="group cursor-pointer">
                       <h5 className="text-sm font-bold text-slate-900 group-hover:text-[#f97316] transition-all leading-snug tracking-tight">{job.title}</h5>
                       <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{job.company}</p>
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">Active</span>
                       </div>
                    </div>
                 ))}
              </div>
              <Link href="/dashboard/jobs" className="mt-8 flex items-center justify-center w-full py-3.5 bg-slate-900 text-[10px] font-black text-white hover:bg-[#f97316] transition-all rounded-xl shadow-lg shadow-slate-200 hover:shadow-orange-200 uppercase tracking-[0.2em]">
                 Enter Career Hub
              </Link>
           </div>

           <div className="px-4 space-y-4">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Institutional Protocol v2.0</p>
              <div className="flex gap-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                 <Link href="/dashboard/terms" className="hover:text-slate-900 transition-colors">Legal</Link>
                 <Link href="/dashboard/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
                 <Link href="/dashboard/profile/self" className="hover:text-slate-900 transition-colors">Identity</Link>
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
}

function Zap(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("lucide lucide-zap", props.className)}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
