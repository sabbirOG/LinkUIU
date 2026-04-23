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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#f97316] rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Feed</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: Profile Summary */}
        <aside className="lg:w-72 flex-shrink-0 space-y-6 hidden lg:block">
           <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-20 bg-slate-900 relative">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }}></div>
              </div>
              <div className="px-6 pb-6 -mt-10 relative">
                 <div className="h-20 w-20 bg-white rounded-2xl p-1.5 shadow-sm mx-auto border border-slate-100">
                    <div className="h-full w-full bg-slate-50 rounded-xl flex items-center justify-center text-2xl font-bold text-[#f97316]">
                       {currentUser.name.charAt(0)}
                    </div>
                 </div>
                 <div className="mt-4 text-center">
                    <h2 className="font-bold text-lg text-slate-900 leading-tight">{currentUser.name}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{currentUser.job}</p>
                 </div>
                 
                 <div className="mt-6 pt-6 border-t border-slate-100 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-medium text-slate-400">Network Connections</span>
                       <span className="font-bold text-slate-900">1.2k</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-medium text-slate-400">Engagement Score</span>
                       <span className="font-bold text-[#f97316]">Elite</span>
                    </div>
                 </div>
              </div>
              <Link href="/dashboard/profile/self" className="flex items-center justify-center py-4 bg-slate-50 border-t border-slate-100 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                 Manage Identity
              </Link>
           </div>

           <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl">
              <h4 className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldCheck size={14}/> Verified Insights
              </h4>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Your profile is <span className="text-slate-900 font-bold">85% complete</span>. 
                Complete your experiences to reach Elite status.
              </p>
           </div>
        </aside>

        {/* MAIN FEED */}
        <div className="flex-1 max-w-2xl space-y-8">
           
           {/* Post Input */}
           <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <form onSubmit={handleCreatePost} className="flex gap-4">
                 <div className="h-10 w-10 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-300 font-bold border border-slate-100">
                    {currentUser.name.charAt(0)}
                 </div>
                 <div className="flex-1 space-y-3">
                    <textarea 
                      rows={1}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share a professional update..." 
                      className="w-full bg-slate-50 border-none focus:ring-0 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-300 transition-all outline-none resize-none min-h-[44px]"
                    />
                    {postContent.trim() && (
                       <div className="flex justify-end animate-in fade-in slide-in-from-top-2 duration-300">
                          <button 
                            disabled={isPosting}
                            className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 hover:bg-[#f97316]"
                          >
                             {isPosting ? <Loader2 size={14} className="animate-spin" /> : "Post Update"}
                          </button>
                       </div>
                    )}
                 </div>
              </form>
           </div>

           {/* Ranked Stream */}
           <div className="space-y-6">
              {pulseFeed.map((item) => (
                 <div key={item.feedId} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-5">
                       <div className="flex items-center gap-4">
                          <Link href={`/dashboard/profile/${item.author?.id || item.postedBy?.id}`} className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-300 border border-slate-100 hover:text-[#f97316] transition-all overflow-hidden">
                             {item.author?.name?.charAt(0) || item.company?.charAt(0)}
                          </Link>
                          <div>
                             <div className="flex items-center gap-2">
                                <Link href="#" className="font-bold text-base text-slate-900 hover:text-[#f97316] transition-colors">{item.author?.name || item.company}</Link>
                                <span className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border leading-none",
                                  item.type === 'job' ? 'bg-orange-50 text-[#f97316] border-orange-100' : 
                                  item.type === 'event' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                )}>
                                   {item.type}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-400">
                                <span>{item.author?.dept || 'UIU Global'}</span>
                                <span>•</span>
                                <span>{formatRelativeTime(item.createdAt)}</span>
                             </div>
                          </div>
                       </div>
                       <button className="text-slate-300 hover:text-slate-900 transition-colors"><MoreHorizontal size={20} /></button>
                    </div>

                    <div className="space-y-4">
                       {item.type === 'job' && (
                          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 group hover:border-[#f97316]/20 transition-all">
                             <h5 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{item.title}</h5>
                             <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#f97316]"><TrendingUp size={14} /> {item.salary}</div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><MapPin size={14} /> Dhaka, BD</div>
                             </div>
                             <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                             <Link href="/dashboard/jobs" className="inline-flex h-10 px-6 bg-slate-900 text-white rounded-lg items-center justify-center text-xs font-bold hover:bg-[#f97316] transition-all">Apply to Hub</Link>
                          </div>
                       )}

                       {item.type === 'event' && (
                          <div className="p-5 border border-slate-100 rounded-xl bg-blue-50/20 flex gap-6 items-center">
                             <div className="shrink-0 h-16 w-16 bg-white rounded-xl border border-blue-100 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[10px] font-bold text-blue-500 uppercase leading-none mb-1">{item.month}</span>
                                <span className="text-2xl font-bold text-slate-900 leading-none">{item.day}</span>
                             </div>
                             <div className="flex-1">
                                <h5 className="text-lg font-bold text-slate-900">{item.title}</h5>
                                <div className="flex items-center gap-4 mt-1.5 text-xs font-medium text-slate-500">
                                   <span className="flex items-center gap-1.5"><Clock size={12} /> {item.time}</span>
                                   <span className="flex items-center gap-1.5"><MapPin size={12} /> {item.location}</span>
                                </div>
                             </div>
                          </div>
                       )}

                       {item.type === 'post' && (
                          <p className="text-base font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                       )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-8 text-xs font-bold text-slate-400">
                       <button className="flex items-center gap-2 hover:text-[#f97316] transition-colors">
                          <Zap size={16} /> Insight ({item.pulseScore.toFixed(0)})
                       </button>
                       <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                          <MessageSquare size={16} /> Engage
                       </button>
                       <div className="flex gap-4 ml-auto">
                          <button className="text-slate-200 hover:text-slate-900 transition-colors"><Bookmark size={18} /></button>
                          <button className="text-slate-200 hover:text-slate-900 transition-colors"><Share2 size={18} /></button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* RIGHT COLUMN: Trending */}
        <aside className="lg:w-80 flex-shrink-0 space-y-6 hidden xl:block">
           <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Trending Pulses</h3>
                 <Zap size={16} className="text-[#f97316]" />
              </div>
              <div className="space-y-6">
                 {pulseFeed.filter(i => i.type === 'job').slice(0, 3).map(job => (
                    <div key={job.feedId} className="group cursor-pointer">
                       <h5 className="text-[13px] font-bold text-slate-900 group-hover:text-[#f97316] transition-all leading-snug">{job.title}</h5>
                       <p className="text-xs font-medium text-slate-400 mt-1">{job.company}</p>
                    </div>
                 ))}
              </div>
              <Link href="/dashboard/jobs" className="mt-8 flex items-center justify-center w-full py-3 bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all rounded-xl border border-slate-100">
                 Explore Career Hub
              </Link>
           </div>

           <div className="px-4 text-[10px] font-medium text-slate-300 uppercase tracking-widest leading-loose">
              <p>© 2026 LINKUIU PROFESSIONAL</p>
              <div className="flex gap-3">
                 <span>Governance</span>
                 <span>Identity</span>
                 <span>Network</span>
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
