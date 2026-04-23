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
  const { pulseFeed, currentUser, isLoaded, addPost } = useGlobalStore();
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
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: Profile Summary */}
        <aside className="lg:w-72 flex-shrink-0 space-y-6 hidden lg:block">
           <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="h-16 bg-slate-100"></div>
              <div className="px-6 pb-6 -mt-8 relative">
                 <div className="h-16 w-16 bg-white rounded-xl p-1 shadow-sm mx-auto border border-slate-100">
                    <div className="h-full w-full bg-slate-50 rounded-lg flex items-center justify-center text-xl font-bold text-slate-400">
                       {currentUser.name.charAt(0)}
                    </div>
                 </div>
                 <div className="mt-4 text-center">
                    <h2 className="font-bold text-base text-slate-900">{currentUser.name}</h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{currentUser.job}</p>
                 </div>
                 
                 <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="font-medium text-slate-400 uppercase tracking-tight">Connections</span>
                       <span className="font-bold text-slate-900">1.2k</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="font-medium text-slate-400 uppercase tracking-tight">Profile Status</span>
                       <span className="font-bold text-[#f97316]">Verified</span>
                    </div>
                 </div>
              </div>
              <Link href="/dashboard/profile/self" className="flex items-center justify-center py-3 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
                 Public Profile
              </Link>
           </div>

           <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck size={14}/> Profile Strength
              </h4>
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                Your profile is <span className="text-slate-900 font-bold">85% complete</span>. 
                Keep it updated to stay visible to recruiters.
              </p>
           </div>
        </aside>

        {/* MAIN FEED */}
        <div className="flex-1 max-w-2xl space-y-6">
           
           {/* Post Input */}
           <div className="bg-white border border-slate-200 p-5 rounded-xl">
              <form onSubmit={handleCreatePost} className="flex gap-4">
                 <div className="h-10 w-10 rounded-lg bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-300 font-bold border border-slate-100">
                    {currentUser.name.charAt(0)}
                 </div>
                 <div className="flex-1 space-y-3">
                    <textarea 
                      rows={1}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share a professional update..." 
                      className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#f97316]/30 rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none resize-none min-h-[44px]"
                    />
                    {postContent.trim() && (
                       <div className="flex justify-end">
                          <button 
                            disabled={isPosting}
                            className="bg-slate-900 text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 hover:bg-[#f97316]"
                          >
                             {isPosting ? <Loader2 size={14} className="animate-spin" /> : "Publish"}
                          </button>
                       </div>
                    )}
                 </div>
              </form>
           </div>

           {/* Ranked Stream */}
           <div className="space-y-6">
              {pulseFeed.map((item) => (
                 <div key={item.feedId} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start mb-5">
                       <div className="flex items-center gap-4">
                          <Link href={`/dashboard/profile/${item.author?.id || item.postedBy?.id}`} className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-300 border border-slate-100 hover:border-[#f97316]/30 transition-all overflow-hidden text-sm">
                             {item.author?.name?.charAt(0) || item.company?.charAt(0)}
                          </Link>
                          <div>
                             <div className="flex items-center gap-2">
                                <Link href="#" className="font-bold text-[15px] text-slate-900 hover:text-[#f97316] transition-colors">{item.author?.name || item.company}</Link>
                                <span className={cn(
                                  "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none",
                                  item.type === 'job' ? 'bg-orange-50 text-[#f97316] border-orange-100' : 
                                  item.type === 'event' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                )}>
                                   {item.type}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 mt-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                <span>{item.author?.dept || 'Institutional'}</span>
                                <span className="opacity-30">•</span>
                                <span>{formatRelativeTime(item.createdAt)}</span>
                             </div>
                          </div>
                       </div>
                       <button className="text-slate-300 hover:text-slate-900 transition-colors"><MoreHorizontal size={18} /></button>
                    </div>

                    <div className="space-y-4">
                       {item.type === 'job' && (
                          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
                             <h5 className="text-base font-bold text-slate-900 mb-1">{item.title}</h5>
                             <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#f97316] uppercase tracking-widest"><TrendingUp size={12} /> {item.salary}</div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><MapPin size={12} /> Dhaka, BD</div>
                             </div>
                             <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4 line-clamp-2 italic">{item.description}</p>
                             <Link href="/dashboard/jobs" className="inline-flex h-9 px-6 bg-slate-900 text-white rounded-lg items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:bg-[#f97316] transition-all">View Details</Link>
                          </div>
                       )}

                       {item.type === 'event' && (
                          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50 flex gap-6 items-center">
                             <div className="shrink-0 h-14 w-14 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.month}</span>
                                <span className="text-xl font-bold text-slate-900 leading-none">{item.day}</span>
                             </div>
                             <div className="flex-1">
                                <h5 className="text-base font-bold text-slate-900">{item.title}</h5>
                                <div className="flex items-center gap-4 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                   <span className="flex items-center gap-1.5"><Clock size={12} /> {item.time}</span>
                                   <span className="flex items-center gap-1.5"><MapPin size={12} /> {item.location}</span>
                                </div>
                             </div>
                          </div>
                       )}

                       {item.type === 'post' && (
                          <p className="text-sm font-medium text-slate-700 leading-relaxed border-l-2 border-slate-100 pl-4">{item.content}</p>
                       )}
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                             <TrendingUp size={14} /> Insight
                          </button>
                          <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                             <MessageSquare size={14} /> 12 Comments
                          </button>
                       </div>
                       <div className="flex gap-4">
                          <button className="text-slate-300 hover:text-slate-900 transition-colors"><Bookmark size={18} /></button>
                          <button className="text-slate-300 hover:text-slate-900 transition-colors"><Share2 size={18} /></button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* RIGHT COLUMN: Trending */}
        <aside className="lg:w-80 flex-shrink-0 space-y-6 hidden xl:block">
           <div className="bg-white border border-slate-200 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Feed</h3>
                 <TrendingUp size={14} className="text-slate-400" />
              </div>
              <div className="space-y-5">
                 {pulseFeed.filter(i => i.type === 'job').slice(0, 3).map(job => (
                    <div key={job.feedId} className="group cursor-pointer">
                       <h5 className="text-[13px] font-bold text-slate-900 group-hover:text-[#f97316] transition-all leading-snug">{job.title}</h5>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{job.company}</p>
                    </div>
                 ))}
              </div>
              <Link href="/dashboard/jobs" className="mt-8 flex items-center justify-center w-full py-3 bg-slate-50 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-all rounded-lg border border-slate-100 uppercase tracking-widest">
                 Career Hub
              </Link>
           </div>

           <div className="px-5 space-y-4">
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">© 2026 UIU ALUMNI PROTOCOL</p>
              <div className="flex gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 <Link href="/dashboard/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
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
